export interface Category {
  id: number;
  name: string;
  slug: string;
  color_code: string;
  order_index: number;
}

export interface ImportantDates {
  application_begin?: string;
  last_date?: string;
  fee_last_date?: string;
  exam_date?: string;
  admit_card_date?: string;
  [key: string]: string | undefined;
}

export interface ApplicationFee {
  gen_obc?: string;
  sc_st?: string;
  ph?: string;
  payment_mode?: string;
  [key: string]: string | undefined;
}

export interface AgeLimit {
  min_age?: string;
  max_age?: string;
  extra_info?: string;
  [key: string]: string | undefined;
}

export interface VacancyDetail {
  post_name: string;
  total_post: string;
  eligibility: string;
}

export interface ImportantLinks {
  apply_online?: string;
  download_notification?: string;
  official_website?: string;
  admit_card?: string;
  result?: string;
  [key: string]: string | undefined;
}

export interface Job {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  title: string;
  slug: string;
  department: string;
  post_name: string;
  total_posts: string;
  post_date: string;
  short_info: string;
  important_dates: ImportantDates;
  application_fee: ApplicationFee;
  age_limit: AgeLimit;
  vacancy_details: VacancyDetail[];
  important_links: ImportantLinks;
  source_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TickerAlert {
  id: number;
  text: string;
  link: string;
  is_active: boolean;
  created_at: string;
}

export interface CandidateFilterState {
  age: number | '';
  qualification: string;
  sector: string;
  categoryType: string;
  experience: string;
}
