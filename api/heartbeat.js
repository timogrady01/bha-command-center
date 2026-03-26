export default async function handler(req, res) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  const { data: expiredUnits } = await supabase
    .from('rotation_heartbeat')
    .select('*, inventory_master(make, model, stk)')
    .lt('expiry_timestamp', new Date().toISOString());

  if (expiredUnits && expiredUnits.length > 0) {
    for (const unit of expiredUnits) {
      await supabase
        .from('rotation_heartbeat')
        .update({
          expiry_timestamp: new Date(Date.now() + 15 * 60000).toISOString(),
          rotation_count: unit.rotation_count + 1
        })
        .eq('id', unit.id);
      console.log(`STK# ${unit.inventory_master.stk} hammered.`);
    }
  }
  return res.status(200).json({ status: 'Heartbeat Check Complete' });
}
