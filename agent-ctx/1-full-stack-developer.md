---
Task ID: 1
Agent: full-stack-developer
Task: Build Government Representative Tree & Accountability Dashboard

Work Log:
- Initialized fullstack development environment using the provided init script
- Created comprehensive mock data file (`src/lib/data.ts`) with 22+ government representatives across a 5-level hierarchy (President → Cabinet Ministers → Deputy Ministers → Directors → Department Heads)
- Each representative includes full profile data, performance scores across 6 categories, and accountability records (promises, project milestones, compliance records, public feedback)
- Built the main dashboard page (`src/app/page.tsx`) as a single-page app with all components:
  - **CircularProgress**: SVG-based circular score indicator with color-coded values (green/yellow/orange/red)
  - **ScoreBar**: Category-level progress bars with icons and color coding
  - **TrendIndicator**: Up/down/neutral trend arrows comparing current vs previous scores
  - **PerformanceBadge**: Mini color-coded badge next to each tree node
  - **TreeNode**: Recursive expandable/collapsible tree component with search highlighting
  - **DetailsPanel**: Profile card with biography, responsibilities, direct reports, contact info
  - **ScoreCard**: Full performance score card with circular progress and 6 category bars
  - **AccountabilityView**: 4-tab view (Promises, Projects, Compliance, Feedback) with status icons and progress bars
  - **Header**: App title, search bar, breadcrumb navigation, dark/light toggle
  - **ThemeToggle**: Dark/light mode switch using useSyncExternalStore for reactive dark mode detection
  - **MobileTabNav**: Bottom tab navigation for mobile responsive view
- Updated `globals.css` with navy-blue (#1e3a5f hue) government-style color scheme for both light and dark modes
- Updated `layout.tsx` metadata for the dashboard
- Fixed ESLint errors: Removed setState calls inside useEffect by refactoring to use useSyncExternalStore and event handlers
- All lint checks pass clean

Stage Summary:
- Fully functional Government Accountability Dashboard with interactive hierarchy tree, detail panel, score cards, and accountability views
- 3-column responsive layout (Tree | Details+Score | Accountability) on desktop, tabbed mobile view
- Dark/light mode toggle, search with auto-expand, breadcrumb navigation
- 22+ representatives with realistic performance and accountability data
- Color-coded performance indicators (green 80-100, yellow 60-79, orange 40-59, red 0-39)
- All files: `src/lib/data.ts`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`
