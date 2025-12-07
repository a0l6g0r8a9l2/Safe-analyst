export enum MockType {
  PERSON = 'Person Name',
  ORGANIZATION = 'Organization',
  API_KEY = 'API Key/Token',
  EMAIL = 'Email',
  IP_ADDRESS = 'IP Address',
  DATE = 'Date',
  LOCATION = 'Location',
  HOST = 'Host/Domain',
  SYSTEM_NAME = 'System/Module',
  SOCIAL_HANDLE = 'Social Handle',
  PHONE = 'Phone Number',
  CUSTOM = 'Custom',
}

export interface ReplacementRule {
  id: string;
  original: string;
  replacement: string;
  type: MockType;
}

export interface AppConfig {
  rules: ReplacementRule[];
}