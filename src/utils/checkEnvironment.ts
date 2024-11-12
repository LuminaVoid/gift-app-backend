export const requiredEnvVars = [
  "HOST",
  "PORT",
  "DB_URL",
  "CP_TOKEN",
  "ADMIN_AUTH",
  "BUCKET_SECRET_KEY",
  "BUCKET_ACCESS_KEY",
  "BUCKET_NAME",
  "TG_BOT_TOKEN",
];

const getEnvironment = (): true | never => {
  for (const varName of requiredEnvVars) {
    if (!(varName in process.env) || process.env[varName] === undefined) {
      console.info(`Env variable ${varName} must be set\n`);
      process.exit(1);
    }
  }
  return true;
};

export default getEnvironment;
