# Frontend Assignment - React + TypeScript + Vite

Bu proje, React, TypeScript ve Vite kullanılarak geliştirilmiş bir frontend uygulamasıdır. JSONPlaceholder API'sinden veri çekerek kullanıcı ve post yönetimi sağlar.

## Live Demo

[React TS CRUD App Live Demo](https://react-ts-crud-app.vercel.app/)

## Özellikler

- **Kullanıcı Yönetimi**: Kullanıcıları listeleme, ekleme, düzenleme ve silme
- **Post Yönetimi**: Postları listeleme, ekleme, düzenleme ve silme
- **İlişki Yönetimi**: Kullanıcılar ve postlar arasında userId ile ilişki kurma
- **Responsive Tasarım**: Modern ve kullanıcı dostu arayüz
- **TypeScript**: Tip güvenliği sağlanmış
- **ESLint**: Kod kalitesi kontrolü

## Teknolojiler

- React 19.1.1
- TypeScript 5.8.3
- Vite 7.1.2
- React Router DOM 7.8.2
- Axios 1.11.0
- React Icons 5.5.0

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

4. **Tarayıcıda açın:**
   ```
   http://localhost:5173
   ```

### Diğer Komutlar

- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview:** `npm run preview`

## Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── Homepage.tsx    # Ana sayfa
│   ├── UserList.tsx    # Kullanıcı listesi
│   └── PostList.tsx    # Post listesi
├── services/           # API servisleri
│   └── api.ts         # JSONPlaceholder API çağrıları
├── types.ts           # TypeScript tip tanımları
├── App.tsx            # Ana uygulama bileşeni
└── main.tsx          # Uygulama giriş noktası
```

## API Endpoints

Bu uygulama JSONPlaceholder API'sini kullanır:
- **Users:** `https://jsonplaceholder.typicode.com/users`
- **Posts:** `https://jsonplaceholder.typicode.com/posts`

## Özellikler Detayı

### Kullanıcı Yönetimi
- Tüm kullanıcıları listeleme
- Yeni kullanıcı ekleme
- Kullanıcı bilgilerini düzenleme
- Kullanıcı silme
- Her kullanıcının post sayısını gösterme

### Post Yönetimi
- Tüm postları listeleme
- Kullanıcıya göre filtreleme
- Yeni post ekleme
- Post düzenleme
- Post silme
- Kullanıcı-post ilişkisi görüntüleme

## Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
