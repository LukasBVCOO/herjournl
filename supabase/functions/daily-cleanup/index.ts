// Runs once a day (pg_cron, see the "daily_cleanup_schedule" migration),
// triggered over HTTP through pg_net with the same shared secret as the
// notification job.
//
//   1. Notes more than 30 days in Recently deleted are removed for good
//      (purge_expired_notes).
//   2. Vision board photos no note uses any more are deleted from the
//      private photo folder (vision_board_unused_photos). This has to happen
//      here: photos can only be deleted through the Storage service, never
//      with plain SQL.
//
// Safety check: if more than half of all photos old enough to be looked at
// would be deleted in one night (and it's more than a handful), something is
// probably wrong with how boards are read, so nothing is deleted and the
// response says so. A real person emptying one board never trips this.
//
// Never reads or returns what's in a note; only counts go back.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

const BUCKET = "vision-board";
const BATCH = 100;
const SAFETY_MIN = 10;

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (!CRON_SECRET || req.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const purged = await supabase.rpc("purge_expired_notes");
  if (purged.error) return reply({ ok: false, step: "notes", message: purged.error.message }, 500);

  const unused = await supabase.rpc("vision_board_unused_photos");
  if (unused.error) return reply({ ok: false, step: "photos", message: unused.error.message }, 500);
  const total = await supabase.rpc("vision_board_photo_count");
  if (total.error) return reply({ ok: false, step: "count", message: total.error.message }, 500);

  const names = ((unused.data ?? []) as { name: string }[]).map((row) => row.name);
  const considered = Number(total.data ?? 0);

  if (names.length > SAFETY_MIN && names.length > considered / 2) {
    return reply({
      ok: false,
      step: "safety-check",
      notesRemoved: purged.data,
      photosUnused: names.length,
      photosConsidered: considered,
      message: "Too many photos looked unused at once; nothing was deleted. Needs a person to check.",
    }, 500);
  }

  let photosRemoved = 0;
  const failures: string[] = [];
  for (let i = 0; i < names.length; i += BATCH) {
    const { data, error } = await supabase.storage.from(BUCKET).remove(names.slice(i, i + BATCH));
    if (error) failures.push(error.message);
    else photosRemoved += data?.length ?? 0;
  }

  return reply({
    ok: failures.length === 0,
    notesRemoved: purged.data,
    photosRemoved,
    photosConsidered: considered,
    failures,
  });
});
