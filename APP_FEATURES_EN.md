# ApiTool - Mobile Beekeeping Management Application

## General Description
ApiTool is a mobile application for comprehensive management of apiaries and beehives. It allows beekeepers to maintain complete control of their operations, from apiary registration to treatment tracking, feeding, harvesting, and statistical analysis.

---

## 1. AUTHENTICATION AND PROFILE

### 1.1 Login
- **Location**: Initial screen when user is not authenticated
- **Functionality**: 
  - Login with email and password
  - Automatic redirect to main screen after successful login

### 1.2 User Profile
- **Access**: From main screen → Settings
- **Features**:
  - Display of personal information (name, surname, email)
  - General statistics summary (total apiaries, hives, apiaries in harvest mode)
  - Total feeding summary (honey, sugar, levudex in kg)
  - Access to device management

### 1.3 Device Management
- **Access**: Profile → Manage Devices
- **Features**:
  - List of all registered devices associated with the account
  - Information for each device: name, platform (iOS/Android), last activity
  - Device deletion (except if only one exists)
  - Automatic device registration when using the app

---

## 2. MAIN SCREEN (HOME)

### 2.1 Main Dashboard
- **Main features**:
  - Personalized greeting based on time of day
  - Information of logged-in user
  - Notification bell (quick access to notifications)
  - Quick statistics: total apiaries and hives
  - Current weather information (temperature and precipitation) based on GPS location

### 2.2 Quick Access
The main screen includes quick access buttons to all sections:

1. **My Apiaries**: Complete list of apiaries
2. **Map**: Geographic view of apiaries on interactive map
3. **ApiScanner**: Barcode scanner for drums
4. **Statistics**: Analysis and statistical reports
5. **Settings**: Profile and application settings
6. **AI Assistant**: Chat with artificial intelligence specialized in beekeeping

---

## 3. APIARY MANAGEMENT

### 3.1 Apiary List
- **Access**: Home → My Apiaries
- **Features**:
  - Display of all apiaries in card format
  - Search by apiary name
  - Automatic sorting by update date (most recent first)
  - Pull-to-refresh to update the list
  - Floating button to add new apiary (+)
  - Global harvest button (rose icon) that allows activating/deactivating harvest mode for all apiaries
  - Apiary deletion: long press on a card to delete
  - Navigation to apiary detail when tapping a card

### 3.2 Apiary Detail
- **Access**: Apiary List → Tap an apiary
- **Information displayed**:
  - Apiary image
  - Apiary name
  - Quick access buttons: History and Settings
  - Detailed information organized by categories:
    - **Colony**: Number of hives
    - **Status**: Current apiary status
    - **Feeding**: Honey (kg), Levudex (kg), Sugar (kg)
    - **Treatments**: 
      - Oxalic (days since last treatment)
      - Amitraz (days since last treatment)
      - Flumethrin (days since last treatment)
    - **Other**: 
      - Transhumance (number of hives)
      - Electric fence (days since last review)
    - **Supers**: Full, medium, and small supers
  - Apiary comments (if any)

### 3.3 Add New Apiary
- **Access**: Apiary List → "+" button
- **Process**:
  1. **Basic data screen**:
     - Apiary name
     - Number of hives
     - Initial status
     - Apiary image (optional, from gallery or camera)
     - Geographic location (latitude/longitude) - optional
  2. **Initial configuration screen**:
     - Feeding configuration (honey, levudex, sugar)
     - Treatment configuration (oxalic, amitraz, flumethrin)
     - Super configuration (full, medium, small)
     - Other options configuration (transhumance, electric fence)
     - Initial comments
  3. Save and create apiary

### 3.4 Apiary Settings
- **Access**: Apiary Detail → Settings button (gear icon)
- **Features**:
  - Edit all apiary parameters
  - Field visibility configuration (what information to show/hide)
  - Task management (list of pending and completed tasks)
  - Harvest mode: activate/deactivate for specific apiary
  - Automatic harvest: automatic harvest configuration
  - Save changes

### 3.5 Apiary Visit
- **Access**: Apiary Detail → "Visit" button
- **Features**:
  - Visit registration to apiary
  - Data update during visit
  - Change and modification logging
  - Update treatments, feeding, etc.

### 3.6 Apiary History
- **Access**: Apiary Detail → History button (file icon)
- **Features**:
  - Chronological display of all changes made to the apiary
  - Visual timeline with dates and times
  - Detail of each change: modified field, old value and new value
  - Readable format of technical variables (e.g., "tOxalic" displayed as "Oxalic")
  - Sorting by date (most recent first)

### 3.7 Apiary Map
- **Access**: Home → Map
- **Features**:
  - Interactive map view with Google Maps
  - Yellow markers with hive icon for each apiary
  - Automatic user location (GPS)
  - Apiaries are displayed on the map with their locations
  - When tapping a marker:
    - Marker is highlighted with yellow border
    - Floating card appears at the bottom with:
      - Apiary name
      - Number of hives
      - Status (if active)
      - "View Apiary" button to navigate to detail
      - Close button (X) to hide the card
  - Standard map zoom and navigation
  - Street and route view on map

---

## 4. APISCANNER (DRUM SCANNER)

### 4.1 Instructions
- **Access**: Home → ApiScanner
- **Functionality**: Informative screen with tips for using the scanner:
  - Optimal scanning distance (15-30 cm)
  - Lighting requirements
  - Barcode verification
  - Information about duplicate codes
  - "Start Scanning" button to continue

### 4.2 Scanned Drums List
- **Access**: Instructions → Start Scanning
- **Features**:
  - List of all scanned drums
  - Filters: "All" (all drums) and "Sold" (only drums marked as sold)
  - Information per drum:
    - Barcode (format: XX-XXXXXXXX-X)
    - Tare (kg)
    - Total weight (kg)
    - Net weight automatically calculated (total weight - tare)
  - Visual indicator for duplicate codes (yellow border and alert badge)
  - Drum deletion: long press on a drum
  - Floating yellow button with camera to scan new drum
  - Options menu (three-dot button):
    - Export data: Excel or Plain text
    - Delete all drums (only unsold)
  - Summary at end of list:
    - Total drums
    - Total net weight calculated
  - Pull-to-refresh to update

### 4.3 Barcode Scanner
- **Access**: Drum List → Camera button
- **Features**:
  - Device camera activation
  - Camera permission request if necessary
  - Visual scanning frame with animation
  - Automatic barcode scanning (UPC-A, UPC-E, EAN8, EAN13, Code128, Code39, Code93)
  - Automatic formatting of scanned code to standard format (XX-XXXXXXXX-X)
  - Code format validation
  - Automatic navigation to form after successful scan
  - Rescan option if code is invalid

### 4.4 Drum Data Form
- **Access**: Automatic after scanning valid code
- **Features**:
  - Scanned code displayed (non-editable)
  - Tare field (kg): with suggested value from last scanned drum
  - Total Weight field (kg)
  - Automatic calculation and display of Net Weight (total weight - tare)
  - Validations:
    - Both fields required
    - Numeric values greater than 0
    - Total weight must be greater than tare
  - "Save Drum" button that:
    - Saves drum
    - Saves tare for future use
    - Navigates back to list
  - Loading indicator during save

---

## 5. STATISTICS

### 5.1 Statistics Screen
- **Access**: Home → Statistics
- **Sections**:

#### 5.1.1 General Statistics
- Total apiaries
- Total hives
- Most common general status

#### 5.1.2 Total Feeding
- Total honey (kg)
- Total sugar (kg)
- Total levudex (kg)

#### 5.1.3 Harvest
- Total supers (calculation: full supers + medium supers × 0.75 + small supers × 0.5)
- Full supers
- Number of apiaries in harvest mode

---

## 6. ARTIFICIAL INTELLIGENCE ASSISTANT

### 6.1 AI Chat
- **Access**: Home → "Chat here" button in AI promotional card
- **Features**:
  - Messaging-style chat interface
  - User messages on the right (black background)
  - AI responses on the left (white background)
  - Differentiated avatars (user and AI)
  - Timestamps on each message
  - "Typing..." indicator when AI is processing
  - Message history is saved automatically
  - Conversation continuity: maintains context between messages
  - Clear chat button (delete history)
  - Back button
  - Multiline text field for writing messages
  - Send button (only active when there is text)
  - Clear error messages if something goes wrong

### 6.2 Specialization
- AI is specialized in beekeeping topics
- Can answer questions about:
  - Hive management
  - Beekeeping treatments
  - Bee feeding
  - Honey harvesting
  - Common problems in apiaries
  - Beekeeping best practices

---

## 7. NOTIFICATIONS

### 7.1 Notifications Screen
- **Access**: Home → Notification bell (top right corner)
- **Features**:
  - List of received notifications
  - Information per notification: message and date/time
  - Automatic navigation from push notifications to relevant sections
  - Status: currently under development (shows informative message)

---

## 8. APP FEATURES AND PERMISSIONS

### 8.1 Design
- Modern and clean interface
- Main colors: yellow, black, white
- Intuitive navigation
- Interface adapts to different device sizes

### 8.2 Required Permissions
- **Camera**: To scan barcodes and take apiary photos
- **Location**: To show weather and locate apiaries on map
- **Storage**: To save images and data
- **Notifications**: To receive alerts and notifications

---

## 9. MAIN USE FLOWS

### 9.1 Apiary Registration Flow
1. Home → My Apiaries
2. Tap "+" button
3. Complete basic data (name, hives, status, image, location)
4. Configure initial parameters (feeding, treatments, supers)
5. Save → Apiary created and visible in list

### 9.2 Drum Scanning Flow
1. Home → ApiScanner
2. Read instructions → Start Scanning
3. Tap floating camera button
4. Scan drum barcode
5. Complete form (tare and total weight)
6. Save → Drum added to list

### 9.3 Statistics Consultation Flow
1. Home → Statistics
2. View general summary
3. Review total feeding
4. Consult harvest data

### 9.4 Map Usage Flow
1. Home → Map
2. View apiaries on map
3. Tap apiary marker
4. View information in floating card
5. Tap "View Apiary" to go to full detail

### 9.5 AI Consultation Flow
1. Home → "Chat here" button (AI card)
2. Write question about beekeeping
3. Send message
4. Receive AI response
5. Continue conversation or clear chat

---

## 10. MAIN DATA AND ENTITIES

### 10.1 Apiary
- Name
- Image
- Number of hives
- Status (active, inactive, etc.)
- Geographic location (latitude, longitude)
- Feeding: honey, levudex, sugar (in kg)
- Treatments: oxalic, amitraz, flumethrin (days since last treatment)
- Supers: full, medium, small
- Other: transhumance, electric fence
- Comments
- Configuration: harvest mode, field visibility, tasks

### 10.2 Drum
- Barcode (format: XX-XXXXXXXX-X)
- Tare (kg)
- Total weight (kg)
- Net weight (calculated: total weight - tare)
- Sale status (sold/unsold)
- Creation and update dates

### 10.3 User
- Name and surname
- Email
- Associated devices

---

## 12. ADDITIONAL FEATURES

### 12.1 Harvest Mode
- Global activation from apiary list
- Individual activation per apiary
- Configurable automatic mode
- Affects statistics calculation

### 12.2 Search and Filtering
- Apiary search by name
- Drum filtering (all/sold)
- Automatic sorting by date

### 12.3 Data Export
- Export drums to Excel
- Export drums to plain text
- Share generated files

### 12.4 Task Management
- Task list per apiary
- Completed/pending tasks
- Storage in apiary configuration

---

## 13. STATES AND CONFIGURATIONS

### 13.1 Apiary States
- Active
- Inactive
- Warning
- Other customizable states

### 13.2 Visibility Configurations
- Control of which fields to show in apiary detail
- Configuration by category (feeding, treatments, other)

### 13.3 Saved Data
- AI chat history
- User data
- App preferences

---

This document describes all the main features of the ApiTool application. The app is designed to be a complete beekeeping management tool, facilitating the registration, tracking, and analysis of all aspects related to beekeeping.

