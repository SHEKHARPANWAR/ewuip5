/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Configure dotenv
dotenv.config();

// Get current filename and directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

// --- INITIAL SEED DATA ---
const INITIAL_TEAMS = [
  {
    code: 'Team-1',
    name: 'Workforce Wizards',
    module: 'Contractual Manpower',
    leader: 'Mahalingam (TL)',
    fy25Expenses: 1720000000,
    targetReduction: 86000000,
    costSaved25_26: 42991068,
    costSaved26_27: 7651485,
  },
  {
    code: 'Team-2',
    name: 'Resource Ranger',
    module: 'Pantry & Stationery',
    leader: 'J.P Rai (TL)',
    fy25Expenses: 35000000,
    targetReduction: 1750000,
    costSaved25_26: 1259809,
    costSaved26_27: 232680,
  },
  {
    code: 'Team-3',
    name: 'Efficiency Avengers',
    module: 'Infrastructure',
    leader: 'Solomon (TL)',
    fy25Expenses: 500000000,
    targetReduction: 13675899.85,
    costSaved25_26: 7791673.6,
    costSaved26_27: 954748,
  },
  {
    code: 'Team-4',
    name: 'Mighty Mavericks',
    module: 'H.k & Material',
    leader: 'Arun Kumar Pandey (TL)',
    fy25Expenses: 70000000,
    targetReduction: 3500000,
    costSaved25_26: 1375234,
    costSaved26_27: 252594,
  },
  {
    code: 'Team-5',
    name: 'X-Force',
    module: 'Security',
    leader: 'Vinay Kumar Sharma (TL)',
    fy25Expenses: 50000000,
    targetReduction: 2500000,
    costSaved25_26: 8367904,
    costSaved26_27: 457426,
  },
  {
    code: 'Team-6',
    name: 'Velocity Van Guards',
    module: 'Travel',
    leader: 'Dahlia Lewis (TL)',
    fy25Expenses: 20000000,
    targetReduction: 1000000,
    costSaved25_26: 5800386,
    costSaved26_27: 1242987,
  },
];

const HISTORICAL_RAW: Array<[string, string, string, string, number, number, string]> = [
  // Workforce Wizards (Team-1)
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'April', 2025, 1569977, 'Workforce Allocation Savings - Apr 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'May', 2025, 2006162, 'Shift Duty Optimization - May 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'June', 2025, 2866150, 'Contract Manpower Rationalization - Jun 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'July', 2025, 3200926, 'Support Staff Restructuring - Jul 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'August', 2025, 3643794, 'Overtime Billing Audits - Aug 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'September', 2025, 3805276, 'Operations Consolidation - Sep 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'October', 2025, 3650211, 'Vendor Margin Negotiations - Oct 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'November', 2025, 3879412, 'Roster Management Automation - Nov 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'December', 2025, 3915204, 'Resource Utilization Phase I - Dec 2025'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'January', 2026, 4709539, 'SLA Billing Benchmarking - Jan 2026'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'February', 2026, 4616502, 'Staff Scaling Alignments - Feb 2026'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'March', 2026, 5127915, 'Annual Roster Finalization - Mar 2026'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'April', 2026, 3633075, 'Direct Labor Renegotiations - Apr 2026'],
  ['Team-1', 'Workforce Wizards', 'Mahalingam (TL)', 'May', 2026, 4018410, 'Contractor SLA Streamlining - May 2026'],

  // Resource Ranger (Team-2)
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'June', 2025, 98703, 'Stationery Procurement Audit - Jun 2025'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'July', 2025, 63419, 'Pantry Brand Standardizations - Jul 2025'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'August', 2025, 34515, 'Consumable Waste Audits - Aug 2025'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'September', 2025, 122893, 'Office Supply Consolidation - Sep 2025'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'October', 2025, 125476, 'Bulk Order Renegotiations - Oct 2025'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'November', 2025, 90302, 'Pantry Supply Scheduling - Nov 2025'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'December', 2025, 64646, 'Stationery Dispenser Controls - Dec 2025'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'January', 2026, 192981, 'Paperless Voucher Rollout - Jan 2026'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'February', 2026, 165872, 'Digital Sign-off Integrations - Feb 2026'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'March', 2026, 301002, 'Annual Print Volume Cap - Mar 2026'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'April', 2026, 113620, 'Bulk Pantry Consumables Refit - Apr 2026'],
  ['Team-2', 'Resource Ranger', 'J.P Rai (TL)', 'May', 2026, 119060, 'Digital Forms Transition - May 2026'],

  // Efficiency Avengers (Team-3)
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'July', 2025, 36080, 'IT Server Containment Systems - Jul 2025'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'August', 2025, 159312, 'Smart Cooling Thermostat Sync - Aug 2025'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'September', 2025, 155669, 'Server Rack Relocations - Sep 2025'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'October', 2025, 197350, 'AC Run-Time Optimization - Oct 2025'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'November', 2025, 578069, 'Data Center Consolidation - Nov 2025'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'December', 2025, 635840.8, 'UPS Battery Smart Recycling - Dec 2025'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'January', 2026, 2546844, 'HVAC Energy Savings Controls - Jan 2026'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'February', 2026, 721944.8, 'Night-mode Climate Automation - Feb 2026'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'March', 2026, 2731764, 'Infrastructure Green Power Sync - Mar 2026'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'April', 2026, 431874, 'Rooftop Solar Integration - Apr 2026'],
  ['Team-3', 'Efficiency Avengers', 'Solomon (TL)', 'May', 2026, 522874, 'Power Factor Correction Phase 2 - May 2026'],

  // Mighty Mavericks (Team-4)
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'June', 2025, 112264, 'HK Material Procurement Audit - Jun 2025'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'July', 2025, 112264, 'Consumable Dispenser Settings - Jul 2025'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'August', 2025, 168396, 'Direct Sourcing Biodegradables - Aug 2025'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'September', 2025, 112264, 'HK Shift Schedulers Redo - Sep 2025'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'October', 2025, 154363, 'Waste Credit Streamlining - Oct 2025'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'November', 2025, 126297, 'HK Vendor Margin Caps - Nov 2025'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'December', 2025, 168396, 'Bulk Refill Transition - Dec 2025'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'January', 2026, 140330, 'Compost Equipment Sync - Jan 2026'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'February', 2026, 154363, 'Recyclables Waste Revenue - Feb 2026'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'March', 2026, 126297, 'HK Roster Optimization - Mar 2026'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'April', 2026, 112264, 'Biodegradable Volume Buying - Apr 2026'],
  ['Team-4', 'Mighty Mavericks', 'Arun Kumar Pandey (TL)', 'May', 2026, 140330, 'Cleaning Chemical Direct Slops - May 2026'],

  // X-Force (Team-5)
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'June', 2025, 1871726, 'CCTV Camera remote feeds - Jun 2025'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'July', 2025, 693402, 'Access Gate Card Automations - Jul 2025'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'August', 2025, 626325, 'Guard Patrol Route Re-loggers - Aug 2025'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'September', 2025, 514224, 'Perimeter Lighting Energy LED - Sep 2025'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'October', 2025, 668375, 'Remote Guarding Integration - Oct 2025'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'November', 2025, 452357, 'Duty Headcount Optimization - Nov 2025'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'December', 2025, 533340, 'Control Room Consolidation - Dec 2025'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'January', 2026, 549427, 'Contractor Margin Cuts - Jan 2026'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'February', 2026, 281169, 'RF Gate Reader Finalization - Feb 2026'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'March', 2026, 2177559, 'Smart Security Patrol Hub - Mar 2026'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'April', 2026, 191583, 'Guard Shifts Streamlining - Apr 2026'],
  ['Team-5', 'X-Force', 'Vinay Kumar Sharma (TL)', 'May', 2026, 265843, 'Automated Roster Verification - May 2026'],

  // Velocity Van Guards (Team-6)
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'June', 2025, 291354, 'Flight Booking Consolidations - Jun 2025'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'July', 2025, 618803, 'Car Pool Cab Routings - Jul 2025'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'August', 2025, 788659, 'Travel SLA Margin Caps - Aug 2025'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'September', 2025, 629128, 'Corporate Flight Flat Rebates - Sep 2025'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'October', 2025, 715117, 'Local Commute Vendor Bids - Oct 2025'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'November', 2025, 642503, 'Virtual Alignment Promotion - Nov 2025'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'December', 2025, 396882, 'Airport Transit Clustering - Dec 2025'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'January', 2026, 527111, 'Inter-Campus EV Shuttles - Jan 2026'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'February', 2026, 682513, 'Off-peak Route Optimization - Feb 2026'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'March', 2026, 508316, 'Hotel Corporate Deal Locks - Mar 2026'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'April', 2026, 497008, 'Electric Vehicle Fleet Phase 2 - Apr 2026'],
  ['Team-6', 'Velocity Van Guards', 'Dahlia Lewis (TL)', 'May', 2026, 745979, 'Airlines Corporate SLA Cuts - May 2026'],
];

function getFYForDate(month: string, year: number): string {
  const mLower = month.trim().toLowerCase();
  const isJanToMar = ['january', 'february', 'march'].includes(mLower);
  if (year === 2025) {
    return 'FY 2025-26';
  } else if (year === 2026) {
    return isJanToMar ? 'FY 2025-26' : 'FY 2026-27';
  } else if (year === 2027) {
    return isJanToMar ? 'FY 2026-27' : 'Future Planned';
  }
  return 'Future Planned';
}

const INITIAL_TASKS = HISTORICAL_RAW.map((row, idx) => {
  const [teamCode, teamName, member, month, year, costSaved, title] = row;
  const fy = getFYForDate(month, year);
  return {
    id: `task-hist-${idx}`,
    teamCode,
    teamName,
    member,
    title,
    description: `Baseline historical savings for ${month} ${year}.`,
    month,
    year,
    fy,
    status: 'Completed',
    costSaved,
    targetSaving: costSaved,
    remarks: 'Historical baseline savings record.',
    createdAt: new Date(`${year}-${month}-15`).toISOString()
  };
});

// --- SUPABASE CLIENT SETUP ---
function getValidSupabaseUrlServer(): string {
  const envUrl = process.env.VITE_SUPABASE_URL;
  if (typeof envUrl === 'string') {
    const trimmed = envUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
  }
  return 'https://vayzgyadhfwvyfsxkwrv.supabase.co';
}

function getValidSupabaseKeyServer(): string {
  const envKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (typeof envKey === 'string') {
    const trimmed = envKey.trim();
    if (trimmed && trimmed !== 'undefined' && trimmed !== 'null' && trimmed.length > 10) {
      return trimmed;
    }
  }
  return 'sb_publishable_Ukasj4C0e3IiKDfBHH1KWA_MmAYKXcG';
}

const SUPABASE_URL = getValidSupabaseUrlServer();
const SUPABASE_ANON_KEY = getValidSupabaseKeyServer();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SUPABASE DATA MAPPING LAYER ---
function mapDbTaskToJs(task: any) {
  return {
    id: task.id,
    teamCode: task.team_code,
    teamName: task.team_name,
    member: task.member,
    title: task.title,
    description: task.description || '',
    month: task.month,
    year: Number(task.year),
    fy: task.fy,
    status: task.status,
    costSaved: Number(task.cost_saved) || 0,
    targetSaving: Number(task.target_saving) || 0,
    remarks: task.remarks || '',
    supportingDocName: task.supporting_doc_name || '',
    createdAt: task.created_at,
  };
}

function mapJsTaskToDb(task: any) {
  return {
    id: task.id,
    team_code: task.teamCode,
    team_name: task.teamName,
    member: task.member,
    title: task.title,
    description: task.description,
    month: task.month,
    year: task.year,
    fy: task.fy,
    status: task.status,
    cost_saved: task.costSaved,
    target_saving: task.targetSaving,
    remarks: task.remarks,
    supporting_doc_name: task.supportingDocName,
    created_at: task.createdAt,
  };
}

function mapDbTeamToJs(team: any) {
  return {
    code: team.code,
    name: team.name,
    module: team.module,
    leader: team.leader,
    fy25Expenses: Number(team.fy25_expenses) || 0,
    targetReduction: Number(team.target_reduction) || 0,
    costSaved25_26: Number(team.cost_saved_25_26) || 0,
    costSaved26_27: Number(team.cost_saved_26_27) || 0,
  };
}

function mapJsTeamToDb(team: any) {
  return {
    code: team.code,
    name: team.name,
    module: team.module,
    leader: team.leader,
    fy25_expenses: team.fy25Expenses,
    target_reduction: team.targetReduction,
    cost_saved_25_26: team.costSaved25_26,
    cost_saved_26_27: team.costSaved26_27,
  };
}

// --- DATA ACCESS HELPERS ---
async function readDatabase() {
  try {
    const content = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Database doesn't exist yet, initialize it
    const data = {
      teams: INITIAL_TEAMS,
      tasks: INITIAL_TASKS,
    };
    await writeDatabase(data);
    return data;
  }
}

async function writeDatabase(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const IS_DEFAULT_SUPABASE = SUPABASE_URL === 'https://vayzgyadhfwvyfsxkwrv.supabase.co' || !process.env.VITE_SUPABASE_URL;
let supabaseFailed = false;

async function getSupabaseData() {
  if (IS_DEFAULT_SUPABASE || supabaseFailed) {
    return { isSupabase: false, teams: [], tasks: [] };
  }
  try {
    // Attempt to fetch teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      throw new Error(`Failed to query teams from Supabase: ${teamsError.message}`);
    }

    // Attempt to fetch tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) {
      throw new Error(`Failed to query tasks from Supabase: ${tasksError.message}`);
    }

    // If both succeed but teams are empty, seed them!
    if (teamsData.length === 0) {
      console.log('[Supabase] Database is empty. Seeding initial teams and tasks...');
      
      // Seed teams
      const dbTeams = INITIAL_TEAMS.map(mapJsTeamToDb);
      const { error: seedTeamsError } = await supabase.from('teams').insert(dbTeams);
      if (seedTeamsError) {
        console.error('[Supabase] Error seeding teams:', seedTeamsError);
      }

      // Seed tasks
      const dbTasks = INITIAL_TASKS.map(mapJsTaskToDb);
      // Insert in chunks of 50 to avoid any size limits
      for (let i = 0; i < dbTasks.length; i += 50) {
        const chunk = dbTasks.slice(i, i + 50);
        const { error: seedTasksError } = await supabase.from('tasks').insert(chunk);
        if (seedTasksError) {
          console.error('[Supabase] Error seeding tasks chunk:', seedTasksError);
        }
      }

      // Re-fetch after seeding
      const { data: newTeams } = await supabase.from('teams').select('*');
      const { data: newTasks } = await supabase.from('tasks').select('*');
      return {
        teams: (newTeams || []).map(mapDbTeamToJs),
        tasks: (newTasks || []).map(mapDbTaskToJs),
        isSupabase: true
      };
    }

    return {
      teams: teamsData.map(mapDbTeamToJs),
      tasks: (tasksData || []).map(mapDbTaskToJs),
      isSupabase: true
    };
  } catch (error: any) {
    console.log('[Supabase] Operating in local offline storage mode (using db.json). Note:', error.message);
    supabaseFailed = true;
    return { isSupabase: false, teams: [], tasks: [] };
  }
}

// Start building express server
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API ENDPOINTS ---

  // Export full project code files for GitHub
  app.get('/api/export-code', async (req, res) => {
    try {
      const readFileSafe = async (filePath: string) => {
        try {
          return await fs.readFile(path.join(process.cwd(), filePath), 'utf-8');
        } catch (err) {
          console.warn(`Could not read file: ${filePath}`, err);
          return '';
        }
      };

      const files = {
        'index.html': await readFileSafe('index.html'),
        'src/index.css': await readFileSafe('src/index.css'),
        'src/main.tsx': await readFileSafe('src/main.tsx'),
        'src/types.ts': await readFileSafe('src/types.ts'),
        'src/App.tsx': await readFileSafe('src/App.tsx'),
        'src/lib/supabase.ts': await readFileSafe('src/lib/supabase.ts'),
        'src/components/DetailModal.tsx': await readFileSafe('src/components/DetailModal.tsx'),
        'src/components/EquipmentForm.tsx': await readFileSafe('src/components/EquipmentForm.tsx'),
        'src/components/EquipmentTable.tsx': await readFileSafe('src/components/EquipmentTable.tsx'),
        'src/components/KPICard.tsx': await readFileSafe('src/components/KPICard.tsx'),
        'src/components/LampLogin.tsx': await readFileSafe('src/components/LampLogin.tsx'),
        'src/components/PrintModal.tsx': await readFileSafe('src/components/PrintModal.tsx'),
        'schema.sql': await readFileSafe('schema.sql'),
        'package.json': await readFileSafe('package.json'),
        'tsconfig.json': await readFileSafe('tsconfig.json'),
        'vite.config.ts': await readFileSafe('vite.config.ts'),
      };

      res.json({ success: true, files });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get all teams, tasks, and historical expenses
  app.get('/api/data', async (req, res) => {
    try {
      const sup = await getSupabaseData();
      if (sup.isSupabase) {
        return res.json({
          success: true,
          teams: sup.teams,
          tasks: sup.tasks,
        });
      }

      // Fallback
      const db = await readDatabase();
      res.json({
        success: true,
        teams: db.teams,
        tasks: db.tasks,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create a new cost saving task
  app.post('/api/tasks', async (req, res) => {
    try {
      const {
        teamCode,
        member,
        title,
        description,
        month,
        year,
        fy,
        status,
        costSaved,
        remarks,
        supportingDocName,
      } = req.body;

      if (!teamCode || !title || !status) {
        return res.status(400).json({ success: false, error: 'Missing required task fields.' });
      }

      const sup = await getSupabaseData();
      let teamName = 'Unknown Team';
      if (sup.isSupabase) {
        const team = sup.teams.find((t: any) => t.code === teamCode);
        if (team) teamName = team.name;
      } else {
        const db = await readDatabase();
        const team = db.teams.find((t: any) => t.code === teamCode);
        if (team) teamName = team.name;
      }

      const newTask = {
        id: `task-${Date.now()}`,
        teamCode,
        teamName,
        member: member || 'Unassigned',
        title,
        description: description || '',
        month: month || 'January',
        year: Number(year) || 2026,
        fy: fy || 'FY 2025-26',
        status: status || 'In Progress',
        costSaved: Number(costSaved) || 0,
        targetSaving: Number(costSaved) || 0,
        remarks: remarks || '',
        supportingDocName: supportingDocName || '',
        createdAt: new Date().toISOString(),
      };

      if (sup.isSupabase) {
        const dbTask = mapJsTaskToDb(newTask);
        const { error } = await supabase.from('tasks').insert(dbTask);
        if (error) {
          throw new Error(`Failed to insert task in Supabase: ${error.message}`);
        }
        return res.status(201).json({ success: true, task: newTask });
      }

      // Fallback
      const db = await readDatabase();
      db.tasks.push(newTask);
      await writeDatabase(db);
      res.status(201).json({ success: true, task: newTask });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Bulk create cost saving tasks (for Excel/CSV imports)
  app.post('/api/tasks/bulk', async (req, res) => {
    try {
      const { tasks } = req.body;
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ success: false, error: 'Payload must be an array of tasks.' });
      }

      const sup = await getSupabaseData();
      const importedTasks: any[] = [];
      const db = !sup.isSupabase ? await readDatabase() : null;

      for (const item of tasks) {
        const {
          teamCode,
          member,
          title,
          description,
          month,
          year,
          fy,
          status,
          costSaved,
          remarks,
          supportingDocName,
        } = item;

        if (!teamCode || !title || !status) {
          continue; // Skip invalid rows gracefully
        }

        let teamName = 'Unknown Team';
        if (sup.isSupabase) {
          const team = sup.teams.find((t: any) => t.code === teamCode);
          if (team) teamName = team.name;
        } else if (db) {
          const team = db.teams.find((t: any) => t.code === teamCode);
          if (team) teamName = team.name;
        }

        const newTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          teamCode,
          teamName,
          member: member || 'Unassigned',
          title,
          description: description || '',
          month: month || 'January',
          year: Number(year) || 2026,
          fy: fy || 'FY 2025-26',
          status: status || 'In Progress',
          costSaved: Number(costSaved) || 0,
          targetSaving: Number(costSaved) || 0,
          remarks: remarks || '',
          supportingDocName: supportingDocName || '',
          createdAt: new Date().toISOString(),
        };

        importedTasks.push(newTask);
      }

      if (sup.isSupabase) {
        const dbTasks = importedTasks.map(mapJsTaskToDb);
        // Insert in chunks of 50
        for (let i = 0; i < dbTasks.length; i += 50) {
          const chunk = dbTasks.slice(i, i + 50);
          const { error } = await supabase.from('tasks').insert(chunk);
          if (error) {
            throw new Error(`Failed to bulk insert tasks in Supabase: ${error.message}`);
          }
        }
        return res.status(201).json({ success: true, count: importedTasks.length, tasks: importedTasks });
      }

      // Fallback
      if (db) {
        db.tasks.push(...importedTasks);
        await writeDatabase(db);
      }
      res.status(201).json({ success: true, count: importedTasks.length, tasks: importedTasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update a task (e.g. mark completed, change status or amount)
  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedFields = req.body;
      const sup = await getSupabaseData();

      if (sup.isSupabase) {
        const existingTask = sup.tasks.find((t: any) => t.id === id);
        if (!existingTask) {
          return res.status(404).json({ success: false, error: 'Task not found' });
        }

        const status = updatedFields.status !== undefined ? updatedFields.status : existingTask.status;
        let costSaved = updatedFields.costSaved !== undefined ? Number(updatedFields.costSaved) : existingTask.costSaved;

        const updatedTask = {
          ...existingTask,
          ...updatedFields,
          costSaved,
          status,
          year: updatedFields.year !== undefined ? Number(updatedFields.year) : existingTask.year,
          targetSaving: costSaved,
        };

        const dbTask = mapJsTaskToDb(updatedTask);
        const { error } = await supabase.from('tasks').update(dbTask).eq('id', id);
        if (error) {
          throw new Error(`Failed to update task in Supabase: ${error.message}`);
        }
        return res.json({ success: true, task: updatedTask });
      }

      // Fallback
      const db = await readDatabase();
      const taskIndex = db.tasks.findIndex((t: any) => t.id === id);

      if (taskIndex === -1) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const existingTask = db.tasks[taskIndex];

      // Preserving all entered costSaved amounts directly
      const status = updatedFields.status !== undefined ? updatedFields.status : existingTask.status;
      let costSaved = updatedFields.costSaved !== undefined ? Number(updatedFields.costSaved) : existingTask.costSaved;

      const updatedTask = {
        ...existingTask,
        ...updatedFields,
        costSaved,
        status,
        year: updatedFields.year !== undefined ? Number(updatedFields.year) : existingTask.year,
        targetSaving: costSaved,
      };

      db.tasks[taskIndex] = updatedTask;
      await writeDatabase(db);

      res.json({ success: true, task: updatedTask });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete a task
  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const sup = await getSupabaseData();

      if (sup.isSupabase) {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
          throw new Error(`Failed to delete task in Supabase: ${error.message}`);
        }
        return res.json({ success: true, message: 'Task deleted successfully' });
      }

      // Fallback
      const db = await readDatabase();
      const initialLength = db.tasks.length;
      db.tasks = db.tasks.filter((t: any) => t.id !== id);

      if (db.tasks.length === initialLength) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      await writeDatabase(db);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset database endpoint
  app.post('/api/reset', async (req, res) => {
    try {
      supabaseFailed = false;
      const sup = await getSupabaseData();
      if (sup.isSupabase) {
        // Delete all tasks
        const { error: deleteTasksError } = await supabase.from('tasks').delete().neq('id', 'placeholder');
        if (deleteTasksError) {
          throw new Error(`Failed to clear tasks: ${deleteTasksError.message}`);
        }
        // Delete all teams
        const { error: deleteTeamsError } = await supabase.from('teams').delete().neq('code', 'placeholder');
        if (deleteTeamsError) {
          throw new Error(`Failed to clear teams: ${deleteTeamsError.message}`);
        }

        // Reseed teams
        const dbTeams = INITIAL_TEAMS.map(mapJsTeamToDb);
        const { error: seedTeamsError } = await supabase.from('teams').insert(dbTeams);
        if (seedTeamsError) {
          throw new Error(`Failed to reseed teams: ${seedTeamsError.message}`);
        }

        // Reseed tasks
        const dbTasks = INITIAL_TASKS.map(mapJsTaskToDb);
        for (let i = 0; i < dbTasks.length; i += 50) {
          const chunk = dbTasks.slice(i, i + 50);
          const { error: seedTasksError } = await supabase.from('tasks').insert(chunk);
          if (seedTasksError) {
            throw new Error(`Failed to reseed tasks chunk: ${seedTasksError.message}`);
          }
        }
        return res.json({ success: true, message: 'Supabase database reset to initial standard values.' });
      }

      // Fallback
      const defaultData = {
        teams: INITIAL_TEAMS,
        tasks: INITIAL_TASKS,
      };
      await writeDatabase(defaultData);
      res.json({ success: true, message: 'Database reset to initial standard values.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- VITE INTERACTION LAYER ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Cost Saving Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
