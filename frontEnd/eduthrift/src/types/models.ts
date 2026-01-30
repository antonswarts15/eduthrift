export interface Item {
  id: string;
  item_name?: string;
  name?: string;
  school_name?: string;
  price: number;
  front_photo?: string;
  description?: string;
  category?: string;
  condition?: string;
  size?: string;
  [key: string]: any;
}
