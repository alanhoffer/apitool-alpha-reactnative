# ApiTool - Design, UI, and Architecture Document

This document outlines the current design system, color palette, UI conventions, and architectural structure of the **ApiTool** React Native application. It is intended to serve as a comprehensive reference for AI agents to understand the project's styling and organizational rules before making improvements.

---

## 1. Design System & UI

The application follows a modern and clean interface tailored for mobile devices using React Native and Expo. 

### 1.1 Color Palette
The central color palette is defined in `constants/colors.tsx`. The application relies heavily on Yellow, Black, White, and Blue variations.

- **Primary Brand Color:** `YELLOW` (#F3B202)
- **Secondary / Action Colors:** `BLUE` (#2483f0), `BLUE_DARK` (#1c7ceb), `BLUE_LIGHT` (#398dec)
- **Alerts / Errors:** `RED` (#F0243D), `RED_LIGHT` (#f36071)
- **Backgrounds / Surfaces:**
  - `WHITE` (#ffffff)
  - `WHITE_DARK` (#f8f8f8)
  - `BLACK` (rgb(32, 32, 32))
  - `BLACK_LIGHT` (#2E2E2C)
- **Typography & Details:**
  - `GREY` (rgb(175, 175, 175))
  - `GREY_LIGHT` (rgb(212, 212, 212))
- **Transparent Variations:** `YELLOW_TRANSPARENT`, `GREY_LIGHT_TRANSPARENT`, `BLACK_TRANSPARENT`

### 1.2 Typography
The application uses two primary font families defined in the constants:
- **Body & General Text:** `Open Sans`
- **Headings / Accents:** `Bebas Neue`

### 1.3 Theming System 
Theming logic is located in `constants/themes.tsx` and dynamically adapts based on the operating system's settings (Light/Dark mode detection primarily for Android >= API 29).
- **Light Theme:** Primary (Blue), Background (White), Text (Black)
- **Dark Theme:** Primary (Light Blue), Background (Black), Text (White)

### 1.4 Styling Conventions
- **StyleSheet.create**: Standard React Native styling is preferred over inline styles.
- **Card UI Pattern**: Heavily utilizes Cards with rounded borders, white background, shadow/elevation, and padding (e.g., `ApiaryCard.tsx`).
- **Icons**: Relies substantially on `@expo/vector-icons` (e.g., `MaterialIcons`, `Ionicons`) and custom image assets (`assets/images/icons/`).
- **Badges**: Use of small, rounded tags for specific states (e.g., `individualBadge` using semi-transparent colors like `colors.YELLOW + '20'`).

---

## 2. Architectural Structure

The codebase follows a standard React Native / Expo directory structure grouped by responsibility rather than purely by feature.

### 2.1 File Organization
- **`/assets`**: Contains static resources like images and icons.
- **`/components`**: Reusable UI elements, further subdivided:
  - `/apiary`: Specific components for apiaries (e.g., `ApiaryCard`, `ApiaryInfo`, `ApiaryTreatment`).
  - `/general`: Global shared components (e.g., `SeasonalTipCard`, `VoiceNoteRecorder`).
  - `/buttons`, `/headers`, `/skeletons`, `/animations`, `/notifications`: Dedicated descriptive UI folders.
- **`/constants`**: Contains `colors.tsx`, `themes.tsx`, and `api.tsx` configurations.
- **`/screens`**: Top-level views navigated by React Navigation, categorized by feature module:
  - `/Auth` (Login/Register paths)
  - `/Home` (Dashboard)
  - `/Apiary` (Lists, details, settings)
  - `/Profile`, `/Tasks`, `/Statistics`, `/Scanner`, `/AI`, etc.
- **`/modules`**: Contains API contexts, helper utilities specific to app logic (e.g., `API/AuthContext`, state formatting modules like `Capitalize` or `DatePretty`).
- **`/hooks`**: Custom React hooks (`usePushNotifications`, `useNotificationNavigation`).
- **`/helpers`**: Shared utility functions and singletons like `logger`.
- **`/navigation`**: React Navigation configurations setup.
- **`/types` & `/interfaces`**: TypeScript definitions and interfaces for strict type checking.

### 2.2 Global State & App Entry
- `App.tsx` serves as the root entry point.
- Wraps the application in fundamental context providers: `SafeAreaProvider`, `AuthProvider` (from modules/API), and `Navigation`.
- Manages global push notification listeners globally via `useEffect`.

---

## 3. Notable Patterns for Generative Improvements
When an AI proposes improvements or extensions, it should adhere to these guidelines:
1. **Maintain Consistency**: Use existing color variables from `colors.tsx` (never hardcode hex codes unless introducing a new intentional semantic color).
2. **Component Reusability**: Do not duplicate UI structures; rely on or enhance existing components in `/components/general` or domain-specific subfolders.
3. **Card Styles**: New lists or objects should use the standard Card styling (shadow elevation, 12px border radius, white background).
4. **TypeScript**: Always utilize interfaces when typing React props or API responses.
5. **Responsiveness**: Focus on flexible layouts (Flexbox) and standard React Native components; avoid using arbitrary fixed heights/widths where dynamic sizing is necessary.

---

## 4. Screen-by-Screen Breakdown

This section provides a descriptive breakdown of every screen in the application.

### 4.1 AI
- **`AI/ChatScreen.tsx`**: (Assuming exists based on typical structure, or AI module) Chat interface for interacting with the specialized beekeeping artificial intelligence.

### 4.2 Apiary (My Apiaries)
- **`ApiaryListScreen.tsx`**: Displays all apiaries in a card format. Offers search, sorting, global harvest toggle, and a floating button to add an apiary.
- **`ApiaryScreen.tsx`**: The main detail view of a selected apiary. Shows current status, colony size, feeding/treatment details, and supers.
- **`ApiaryAddScreen.tsx`**: Form to create a new apiary (basic data like name, hives, initial status, image, and location).
- **`ApiaryAddSettingsScreen.tsx`**: Second step in apiary creation to configure feeding, treatments, supers, and electric fence settings.
- **`ApiarySettingsScreen.tsx`**: General settings for the apiary (harvest mode, visibility configuration, etc.).
- **`ApiaryIndividualSettingsScreen.tsx`**: Settings specific to individually managed apiaries.
- **`ApiaryManagementTypeScreen.tsx`**: Selection screen for deciding the management type of the apiary (e.g., individual vs group).
- **`ApiaryVisitScreen.tsx`**: Form to register a visit, update hive data, apply treatments, and log feeding.
- **`ApiaryHistoryScreen.tsx`**: Visual timeline showing chronological changes made to the apiary.
- **`ApiaryMapScreen.tsx`**: Map interface showing all apiaries with markers and basic info cards.
- **`MapSelectionScreen.tsx`**: Reusable map screen for picking a location/coordinates when creating or editing an apiary.

### 4.3 Auth
- **`LoginScreen.tsx`**: Initial authentication screen (email/password).
- **`RegisterScreen.tsx`**: Account creation screen.
- **`ForgotPasswordScreen.tsx`**: Password recovery flow.

### 4.4 Home & Notifications
- **`HomeScreen.tsx`**: The main dashboard after login. Shows greeting, notifications access, quick stats, weather, and quick-access buttons to core modules (My Apiaries, Map, Scanner, AI, Statistics).
- **`NotificationsScreen.tsx`**: List of received push notifications with dates and times.
- **`SplashScreen.tsx`**: Initial loading screen displayed while checking authentication status or loading app assets.

### 4.5 Profile & Devices
- **`ProfileScreen.tsx`**: Displays user info (name, email) and general summary of apiaries, hives, and feeding stats.
- **`EditProfileScreen.tsx`**: Form to modify user details.
- **`ChangePasswordScreen.tsx`**: Interface to update the account password.
- **`DevicesScreen.tsx`**: List of all registered devices for the user account, with options to delete inactive ones.

### 4.6 Scanner (ApiScanner)
- **`ScannerInstructionsScreen.tsx`**: Informational view explaining how to use the barcode scanner correctly.
- **`ScannerCameraScreen.tsx`**: The actual camera interface with an animated scanning frame that captures and formats drum barcodes.
- **`ScannerListScreen.tsx`**: List of all scanned honey drums, showing tare, total weight, and calculated net weight. Includes export and delete options.
- **`ScannerFormScreen.tsx`**: Data entry screen that opens after a successful scan, allowing the user to input Tare and Total Weight for the drum.

### 4.7 Statistics
- **`StatisticsScreen.tsx`**: Analytics dashboard showing total apiaries, hives, overall feeding stats (honey, sugar, levudex), and harvest data (supers collected).

### 4.8 Tasks
- **`TasksScreen.tsx`**: List of pending and completed tasks across all or specific apiaries.
- **`TaskAddScreen.tsx`**: Form to create a new task.

### 4.9 Hive (Individual Hive Management)
- **`HiveScreen.tsx`**: Detail view for an individual hive inside a specific apiary.
- **`HiveAddScreen.tsx`**: Form to add a new hive to an apiary.
- **`HiveVisitScreen.tsx`**: Form dedicated to registering a visit and modifications on a single hive.
- **`HiveHistoryScreen.tsx`**: Chronological timeline of changes made exclusively to a specific hive.
