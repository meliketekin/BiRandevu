export const AppRunIsProd = false;

const qaConfig = {
  API_URL: "https://goldborse-api-qa.35inch.com/mobile",
  BASE_API_URL: "https://goldborse-api-qa.35inch.com",
  //   EXPO_PROJECT_ID: "6c896384-6077-4e1d-9721-b42bd503f601",
};
const prodConfig = {
  API_URL: "https://goldborse-api-qa.35inch.com/mobile",
  BASE_API_URL: "https://goldborse-api-qa.35inch.com",
  //   EXPO_PROJECT_ID: "3d66ed05-bc60-4827-bc7c-f8c68cbada5b",
};
export const AppConfig = {
  ...(AppRunIsProd ? prodConfig : qaConfig),
};

export const CloudinaryConfig = {
  CLOUD_NAME: "dohyjrsc0",
  UPLOAD_PRESET: "cs3p6enw",
  SUPABASE_CLEANUP_URL: "https://wbqtijlzrgipfadgwpwe.supabase.co/functions/v1/cleanup-cloudinary",
};

export const SupabaseConfig = {
  SEND_PASSWORD_RESET_URL: "https://wbqtijlzrgipfadgwpwe.supabase.co/functions/v1/send-password-reset",
};
