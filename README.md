# CampusCoin React Frontend

CampusCoin is a React/Vite frontend implementation of the CampusCoin product design.

## Dashboard & Logging — Figma selection

### Implemented screens / states

| Design | Route / interaction |
|---|---|
| S1 · Dashboard | `/dashboard` |
| S1-L · Dashboard (loading) | `/dashboard?state=loading` |
| S1-D · Dashboard (dark mode) | `/dashboard?theme=dark` |
| S2a · Add transaction (empty) | `/dashboard?add=expense` |
| S2b · Add transaction (AI suggestion) | `/dashboard?state=ai` |
| S2c · Dashboard (expense saved) | `/dashboard?state=saved` or save from Add expense |
| S12 · Notifications panel | `/dashboard?state=notifications` or click the bell |
| S3 · Transactions | `/transactions` |
| S4 · Transaction detail (edit drawer) | `/transactions?drawer=1` or click edit |
| S5 · Categories | `/categories` |

## Included interactions

- Dashboard navigation
- Transaction and category navigation
- Dark-mode toggle
- Loading/skeleton state
- Notification panel
- Add expense and income modal
- AI category suggestion state
- Expense save/update state and toast
- Transaction search
- Transaction edit drawer
- Category creation form
- Responsive desktop/tablet/mobile layouts

## Styling

The project uses plain CSS and React. Tailwind was not added. The dashboard styles are in `src/styles/dashboard.css` and use the CampusCoin design tokens, Inter/Manrope typography, responsive breakpoints, cards, badges, charts, drawers and modal states.

## Development

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

### Final UI layout correction
- Dashboard styles are fully scoped to `.dashboard-app` so they cannot affect the public landing page or auth screens.
- Landing preview cards are explicitly scoped to `.landing` as a second isolation layer.
- Dashboard summary cards preserve the Figma 3-column layout at full desktop width.
- Medium desktop widths switch to a controlled 2-column layout before the cards become too narrow.
- Removed the fixed grid-row behavior that could make Budget vs Actual stretch vertically or cause card placement collisions.
- Mobile dashboard uses a single-column flow with explicit card heights and no overlapping grid placement.


### Student
- Email: `oadizo628@gmail.com`
- Password: `flobaba1234-`
- Successful sign-in → `/dashboard`
- Student sign-out → `/`

### Admin
- Email: `admin@campuscoin.com`
- Password: `admin@123`
- Successful sign-in → `/admin/overview`
- Admin sign-out → `/`

### Connected student routes
`/dashboard`, `/transactions`, `/categories`, `/budgets`, `/reports`, `/ai-insights`, `/saving-tips`, `/bookmarks`, `/import-csv`, `/review-categories`, `/settings`

### Connected admin routes
`/admin/overview`, `/admin/users`, `/admin/categories`, `/admin/announcements`
