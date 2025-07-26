# Spelling Bee Duel - Style Guide

## 🎨 Color Palette

### Primary Colors
- **Background**: `#FFC543` (warm yellow - main app background)
- **Card Background**: `#FFFBF2` (warm off-white - for cards, inputs, buttons)
- **Primary Border**: `#D9A93D` (gold-tinted border for inputs/buttons)
- **Card Border**: `#E8B94E` (lighter gold for card borders)

### Text Colors
- **Primary Text**: `#2E2E2E` (dark gray - main readable text)
- **Secondary Text**: `#333333` (slightly lighter - button text)
- **Placeholder Text**: `#999999` (light gray - input placeholders)
- **Menu Accent**: `#8B4513` (brown - for menu text, accent colors)

### Divider Colors
- **Divider Line**: `#E6C200` (golden line)
- **Divider Text**: `#B8860B` (darker gold for "OR" text)

### Game-Specific Colors (from existing components)
- **Letter Buttons**: `#F7DA21` (bright yellow - outer hexagons)
- **Center Letter**: `#E6C200` (gold - center hexagon)

## 📐 Layout & Spacing

### Border Radius
- **Cards**: `16px` (LobbyCard, major containers)
- **Inputs/Buttons**: `12px` (form elements)
- **Small Elements**: `8px` (small buttons, badges)

### Padding & Margins
- **Card Padding**: `24px` (internal card spacing)
- **Input/Button Padding**: `paddingVertical: 12px, paddingHorizontal: 16px`
- **Screen Padding**: `20px` horizontal, `80px` top (for safe area)
- **Element Spacing**: `24px` between major sections, `12px` between related elements

### Shadows (Consistent Elevation)
```javascript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 2
```

## 🔤 Typography

### Font Weights
- **Regular Text**: `400` (body text, descriptions)
- **Input Text**: `600` (semibold - input fields, important labels)
- **Buttons**: `600` (semibold - button text)
- **Headings**: `bold` (modal titles, section headers)

### Font Sizes
- **Large Logo/Title**: `24-28px`
- **Input Text**: `18px`
- **Button Text**: `16px`
- **Body Text**: `16px`
- **Secondary Text**: `14px`
- **Small Text**: `12px`

## 🎯 Component Patterns

### Cards (LobbyCard pattern)
```javascript
{
  backgroundColor: '#FFFBF2',
  borderRadius: 16,
  padding: 24,
  borderWidth: 1,
  borderColor: '#E8B94E',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}
```

### Form Inputs
```javascript
{
  backgroundColor: '#FFFBF2',
  borderWidth: 1,
  borderColor: '#D9A93D',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontSize: 18,
  fontWeight: '600',
  color: '#2E2E2E',
  minHeight: 48,
  // Add shadow (see above)
}
```

### Buttons
```javascript
{
  backgroundColor: '#FFFBF2',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderWidth: 1,
  borderColor: '#D9A93D',
  minHeight: 48,
  // Add shadow (see above)
}

// Button Text
{
  fontSize: 16,
  fontWeight: '600',
  color: '#333333',
}
```

### Loading States
- **Spinner Color**: `#666666` (neutral gray)
- **Loading Text**: Same as button text but with "..." suffix
- **Disabled Opacity**: `0.6`

## 🎮 Game-Specific Elements

### Letter Hexagons (from GameScreen)
- **Center Letter**: 100px diameter, `#E6C200` background
- **Outer Letters**: 90px diameter, `#F7DA21` background
- **Letter Text**: White or dark contrast, bold weight

### Action Buttons (Game Actions)
- **Height**: `55px` minimum for thumb-friendly tapping
- **Spacing**: `16px` gap between buttons
- **Three-button layout**: Delete, Shuffle, Submit

## 🔧 Interactive Elements

### Touch Feedback
- **activeOpacity**: `0.7` for all touchable elements
- **Disabled State**: `opacity: 0.6`

### Menu Elements
- **Top Menu Button**: 32x32px black circle, white dots
- **Dropdown Cards**: White background, same shadow as other cards
- **Menu Items**: 16px font, `#333333` color

## 📱 Safe Area & Positioning

### Safe Area Handling
- Use `useSafeAreaInsets()` for top positioning
- Menu positioning: `insets.top + 16px`
- Never use hardcoded top values

### Z-Index Layers
- **Modals**: 1000+
- **Dropdowns**: 100+
- **Fixed Elements**: 10+

## 🎨 Theme Philosophy

**Warm & Inviting**: The app should feel like honey, bees, and sunshine - warm yellows and golds with soft shadows.

**Clean & Modern**: Subtle shadows and soft borders rather than harsh lines. Everything should feel integrated, not like separate floating elements.

**Game-Like**: Playful but not childish. Professional but approachable. Think NYT Spelling Bee meets modern mobile app design.

## ⚠️ What to Avoid

- **Stark white backgrounds** - always use the warm off-white `#FFFBF2`
- **Pure gray borders** - use gold-tinted alternatives
- **Sharp shadows** - keep shadowOpacity at 0.1 or lower  
- **Harsh black text** - use `#2E2E2E` or `#333333`
- **Inconsistent border radius** - stick to 12px/16px pattern
- **Hardcoded positioning** - always consider safe areas

---

*This guide ensures all future components maintain the warm, cohesive design established in the lobby screen.*