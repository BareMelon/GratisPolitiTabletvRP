Config = {}

-- ============================================================
-- GENERAL SETTINGS
-- ============================================================
Config.OpenKey = "F7"                    -- Hotkey to open MDT
Config.UseItem = false                   -- Require inventory item?
Config.ItemName = "police_tablet"        -- Item name if UseItem = true
Config.NotificationSound = true          -- Play sound on new BOLO/112
Config.DefaultStatus = "Ikke på arbejde"            -- Default officer status on login

-- ============================================================
-- PERMISSIONS — Which vRP groups can access the MDT?
-- ============================================================
Config.PoliceGroups = {
    "Police",
    "Politi",
    "LSPD",
    "politi",
    "police",
    "Politi-Job",
    "Rigspolitichef"
}

-- ============================================================
-- DATABASE TABLE NAMES
-- Adapt these if your server uses custom naming
-- ============================================================
Config.DB = {
    users           = "vrp_users",
    user_identities = "vrp_user_identities",
    user_vehicles   = "vrp_user_vehicles",
    user_moneys     = "vrp_user_moneys",
}

-- ============================================================
-- FINE SYSTEM
-- FineDeductFrom: "bank" or "wallet"
-- ============================================================
Config.FineDeductFrom = "bank"

Config.FineCategories = {
    { id = "speeding",       label = "Fartoverskridelse",          amount = 2500  },
    { id = "redlight",       label = "Kørsel over for rødt",       amount = 3000  },
    { id = "parking",        label = "Ulovlig parkering",          amount = 1500  },
    { id = "dui",            label = "Spirituskørsel",             amount = 10000 },
    { id = "reckless",       label = "Hensynsløs kørsel",          amount = 5000  },
    { id = "no_license",     label = "Kørsel uden kørekort",       amount = 4000  },
    { id = "no_insurance",   label = "Kørsel uden forsikring",     amount = 3500  },
    { id = "no_seatbelt",    label = "Manglende sikkerhedssele",   amount = 1000  },
    { id = "illegal_tint",   label = "Ulovlige tonede ruder",      amount = 2000  },
    { id = "noise",          label = "Støjforurening (bil)",       amount = 1500  },
    { id = "custom",         label = "Brugerdefineret bøde",       amount = 0     },
}

-- ============================================================
-- OFFICER STATUS CODES (10-codes)
-- ============================================================
Config.StatusCodes = {
    { code = "10-8",  label = "Tilgængelig",         color = "#20c997" },
    { code = "10-6",  label = "Optaget",              color = "#f59e0b" },
    { code = "10-7",  label = "Ikke i tjeneste",      color = "#64748b" },
    { code = "10-38", label = "Trafikkontrol",         color = "#3b82f6" },
    { code = "10-80", label = "Biljagt",               color = "#ef4444" },
    { code = "10-99", label = "Nødsituation",          color = "#dc2626" },
    { code = "10-15", label = "Anholdelse",            color = "#8b5cf6" },
}

-- ============================================================
-- WARRANT PRIORITIES
-- ============================================================
Config.WarrantPriorities = {
    { id = "low",    label = "Lav",    color = "#20c997" },
    { id = "medium", label = "Middel", color = "#f59e0b" },
    { id = "high",   label = "Høj",    color = "#ef4444" },
}

-- ============================================================
-- REPORT CATEGORIES
-- ============================================================
Config.ReportCategories = {
    { id = "traffic",  label = "Trafik" },
    { id = "crime",    label = "Kriminalitet" },
    { id = "domestic", label = "Husspektakler" },
    { id = "drugs",    label = "Narko" },
    { id = "theft",    label = "Tyveri" },
    { id = "assault",  label = "Overfald" },
    { id = "fraud",    label = "Bedrageri" },
    { id = "other",    label = "Andet" },
}

-- ============================================================
-- TRANSLATIONS (DANSK)
-- ============================================================
Config.Lang = {
    -- Permissions
    no_permission       = "Du har ikke adgang til Politiets databaser.",
    missing_item        = "Du har ikke en tablet på dig.",

    -- Citizen
    citizen_not_found   = "Borger ikke fundet i registeret.",
    
    -- Warrants
    warrant_created     = "Efterlysning oprettet.",
    warrant_resolved    = "Efterlysning lukket.",
    
    -- BOLOs
    bolo_created        = "BOLO oprettet og sendt til alle enheder.",
    bolo_resolved       = "BOLO afsluttet.",
    
    -- Reports
    report_created      = "Rapport oprettet.",
    report_updated      = "Rapport opdateret.",
    
    -- Fines
    fine_issued         = "Bøde udstedt.",
    fine_paid           = "Bøde betalt.",
    
    -- Charges
    charge_added        = "Sigtelse registreret.",
    
    -- Dispatch
    call_received       = "Ny 112-opkald modtaget!",
    call_claimed        = "Opkald taget.",
    call_resolved       = "Opkald afsluttet.",
    
    -- Notes
    note_added          = "Notat tilføjet.",
    
    -- Status
    status_updated      = "Status opdateret.",
    
    -- General
    action_success      = "Handling udført.",
    action_failed       = "Handlingen fejlede.",
    loading             = "Indlæser...",
}
