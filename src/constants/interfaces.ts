export interface sDatabase {
  registeredUsers: { userId: number; systemUuid: string }[];
  systems: system[];
}
export interface system {
  id: string;
  uuid: string;
  name: string | null;
  description: string | null;
  tag: string | null;
  pronouns: string | null;
  avatar_url: string | null;
  banner: string | null;
  color: string | null;
  created: Date;
  webhook_url: string | null;
  privacy: {
    description_privacy: string;
    pronoun_privacy: string;
    member_list_privacy: string;
    group_list_privacy: string;
    front_privacy: string;
    front_history_privacy: string;
  };
  config: {
    timezone: string;
    pings_enabled: boolean;
    latch_timeout: string | null;
    member_default_private: boolean;
    group_default_private: boolean;
    show_private_info: boolean;
    member_limit: number;
    group_limit: number;
    description_templates: string[];
  };
  accounts: number[];
  members: headmate[];
}
export interface headmate {
  id: string;
  uuid: string;
  name: string;
  display_name: string | null;
  color: string | null;
  birthday: string | null;
  pronouns: string | null;
  avatar_url: string | null;
  banner: string | null;
  description: string | null;
  created: Date;
  keep_proxy: boolean;
  proxy_tags: { prefix: string | null; suffix: string | null }[];
  privacy: {
    visibility: string;
    name_privacy: string;
    description_privacy: string;
    birthday_privacy: string;
    pronoun_privacy: string;
    avatar_privacy: string;
    metadata_privacy: string;
  };
}
