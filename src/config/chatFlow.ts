export const chatFlow = {
  start_state: "GREETING",
  states: {
    GREETING: {
      message: "Hi! How can I help you today? Please choose an option:",
      buttons: [
        { id: "explore", label: "Explore Study Abroad" },
        { id: "ielts", label: "IELTS / Foreign Language / VISA" },
        { id: "accom", label: "Accommodation Abroad", url: "https://globalmindsindia.com" },
        { id: "jobs", label: "Job Opportunities", url: "https://fastlaneedu.com" },
        { id: "internships", label: "Internships" },
        { id: "schedule", label: "📅 Schedule a Counselling" },
        { id: "achelp-desk", label: "HELP DESK", url: "" },
        { id: "others", label: "Others" },
      ],
    },
    SCHEDULE_NAME: {
      message: "Sure! What is your full name?",
      buttons: [],
    },
    SCHEDULE_PHONE: {
      message: "Please enter your phone number",
      buttons: [],
    },
    SCHEDULE_EMAIL: {
      message: "Please enter your email address",
      buttons: [],
    },
    SCHEDULE_CONFIRM: {
      message: "Please confirm your details before proceeding:",
      buttons: [],
    },
    SCHEDULE_DATE: {
      message: "Select a preferred date from the calendar below ",
      buttons: [],
    },
    SCHEDULE_SLOT: {
      message: "Select an available time slot ",
      buttons: [],
    },

    EXPLORE: {
      message: "Select a country to explore:",
      buttons: [
        { id: "germany", label: "Germany" },
        { id: "uk", label: "UK" },
        { id: "ireland", label: "Ireland" },
        { id: "italy", label: "Italy" },
        { id: "spain", label: "Spain" },
        { id: "back_main", label: "⬅ Back to Main Menu" },
      ],
    },
    COUNTRY_SELECTED: {
      message: "What would you like to know about this country?",
      buttons: [
        {
          id: "cost",
          label: "Cost",
          url: "https://www.globalmindsindia.com/cost-calulator/",
        },
        {
          id: "loans",
          label: "Loans & Schemes",
          url: "https://www.globalmindsindia.com/loan-government-scheme/",
        },
        { id: "back_explore", label: "⬅ Back to Countries" },
        { id: "back_main", label: "⬅ Back to Main Menu" },
      ],
    },

    IELTS: {
      message: "IELTS/Foreign Language/VISA — choose:",
      buttons: [
        {
          id: "ielts_prep",
          label: "IELTS Prep",
          url: "https://globalmindsindia.co.in",
        },
        
        {
          id: "toefl_prep",
          label: "TOEFL",
          url: "https://globalmindsindia.co.in",
        },
        { id: "celpip_prep", label: "CELPIP", url:"https://globalmindsindia.co.in"},
        {
          id: "lang_train",
          label: "Foreign Language Training",
          url: "https://languages.globalmindsindia.in",
        },
        {
          id: "visa_help",
          label: "Visa Assistance",
          url: "https://visa.globalmindsindia.in",
        },
        {
          id: "sop",
          label: "SOP Generation",
          url: "https://sop.globalmindsindia.in",
        },
        {
          id: "aps",
          label: "APS Documentation",
          url: "https://aps.globalmindsindia.in",
        },
        { id: "gre_prep", label: "GRE", url: "https://globalmindsindia.com" },
        { id: "gmat_prep", label: "GMAT", url: "https://globalmindsindia.com" },
        { id: "back_main", label: "⬅ Back to Main Menu" },
      ],
    },
    
    INTERNSHIPS: {
      message: "Choose internship type:",
      buttons: [
        { id: "domestic", label: "Domestic", url: "https://assessment.globalmindsindia.com" },
        { id: "international", label: "International", url: "https://globalmindsindia.com" },
        { id: "back_main", label: "⬅ Back to Main Menu" },
      ],
    },
    OTHERS: {
      message: "Please type your question (or click back to main).",
      buttons: [{ id: "back_main", label: "⬅ Back to Main Menu" }],
    },
  },
  transitions: {
    explore: "EXPLORE",
    germany: "COUNTRY_SELECTED",
    uk: "COUNTRY_SELECTED",
    ireland: "COUNTRY_SELECTED",
    italy: "COUNTRY_SELECTED",
    spain: "COUNTRY_SELECTED",
    back_explore: "EXPLORE",
    ielts: "IELTS",
    accom: "ACCOM",
    internships: "INTERNSHIPS",
    others: "OTHERS",
    cost: "COUNTRY_SELECTED",
    loans: "COUNTRY_SELECTED",
    ielts_prep: "IELTS",
    gre_prep: "IELTS",
    gmat_prep: "IELTS",
    toefl_prep: "IELTS",
    celpip_prep: "IELTS",
    lang_train: "IELTS",
    visa_help: "IELTS",
    shared: "ACCOM",
    hostel: "ACCOM",
    rental: "ACCOM",
    intern: "INTERNSHIPS",

    back_jobs: "JOBS",
    placements: "JOBS",
    work_perm: "JOBS",
    back_main: "GREETING",
    schedule: "SCHEDULE_NAME",
  },
};
