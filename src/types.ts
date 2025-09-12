export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  isLocal?: boolean;
  company?: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
}
export interface Post {
  userId: number;
  id: number;
  title: string;
  body?: string;
  isLocal?: boolean;
}

export interface FormData {
  user?: Partial<User>;
  post?: Partial<Post>;
}