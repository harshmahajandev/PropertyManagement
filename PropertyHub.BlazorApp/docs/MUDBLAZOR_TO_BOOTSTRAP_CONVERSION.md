# MudBlazor to Bootstrap Conversion Guide

## Overview
Converting PropertyHub Blazor app from MudBlazor to Bootstrap to resolve 65+ build errors and improve maintainability.

## Component Mapping

### Layout Components
| MudBlazor | Bootstrap Equivalent | Notes |
|-----------|---------------------|-------|
| `MudThemeProvider` | Remove (use CSS custom properties) | Bootstrap provides built-in theming |
| `MudDialogProvider` | Bootstrap Modals | Use standard HTML dialogs |
| `MudSnackbarProvider` | Bootstrap Toasts | Use Bootstrap toast components |
| `MudLayout` | `div.container-fluid` | Main layout container |
| `MudAppBar` | `nav.navbar` | Navigation bar |
| `MudDrawer` | `nav.sidebar` or `div.collapse` | Side navigation |
| `MudMainContent` | `main.main-content` | Main content area |

### Container & Grid
| MudBlazor | Bootstrap Equivalent | Notes |
|-----------|---------------------|-------|
| `MudContainer` | `div.container` or `div.container-fluid` | Responsive container |
| `MudGrid` | `div.row` | Bootstrap row |
| `MudItem xs="12" md="6"` | `div.col-12 col-md-6` | Bootstrap columns |
| `MudPaper` | `div.card` or `div.panel` | Card-like containers |
| `MudCard` | `div.card` | Card components |
| `MudCardMedia` | `img.card-img-top` | Card images |
| `MudCardContent` | `div.card-body` | Card content |

### Text & Typography
| MudBlazor | Bootstrap Equivalent | Notes |
|-----------|---------------------|-------|
| `MudText Typo="Typo.h4"` | `h4` | HTML headings |
| `MudText Typo="Typo.body1"` | `p` | Paragraph text |
| `MudText Typo="Typo.subtitle2"` | `h6` | Subtitle headings |
| Color attributes | CSS classes | Use Bootstrap color classes |

### Interactive Components
| MudBlazor | Bootstrap Equivalent | Notes |
|-----------|---------------------|-------|
| `MudButton` | `button.btn` | Button elements |
| `MudIconButton` | `button.btn` | Icon buttons |
| `MudButtonGroup` | `div.btn-group` | Button groups |
| `MudChip` | `span.badge` or `span.pill` | Status badges |
| `MudNavMenu` | `nav.nav` | Navigation menus |
| `MudNavLink` | `a.nav-link` | Navigation links |

### Feedback Components
| MudBlazor | Bootstrap Equivalent | Notes |
|-----------|---------------------|-------|
| `MudProgressLinear` | `div.progress` | Progress bars |
| `MudProgressCircular` | `div.spinner-border` | Loading spinners |

### Layout Utilities
| MudBlazor | Bootstrap Equivalent | Notes |
|-----------|---------------------|-------|
| `MudStack Row="true"` | `div.d-flex.justify-content-between` | Flexbox layouts |
| `MudSpacer` | `div.flex-grow-1` | Spacer elements |
| `Class="pa-4"` | `p-4` | Padding utilities |
| `Class="mb-4"` | `mb-4` | Margin utilities |

## Icons
- **Current**: `Icons.Material.Filled.*` from MudBlazor
- **Replacement**: Font Awesome or simple CSS icons
- **Example**: `MudIcon Icon="@Icons.Material.Filled.Home"` → `<i class="fas fa-home"></i>`

## Key Conversion Patterns

### 1. Page Structure
```razor
<!-- Before: MudBlazor -->
<MudContainer MaxWidth="MaxWidth.Large" Class="mt-4">
    <MudPaper Elevation="2" Class="pa-4">
        <MudText Typo="Typo.h4">Title</MudText>
        <!-- content -->
    </MudPaper>
</MudContainer>

<!-- After: Bootstrap -->
<div class="container mt-4">
    <div class="card shadow-sm p-4">
        <h4>Title</h4>
        <!-- content -->
    </div>
</div>
```

### 2. Grid Layout
```razor
<!-- Before: MudBlazor -->
<MudGrid>
    <MudItem xs="12" md="6">
        <MudCard>Content</MudCard>
    </MudItem>
    <MudItem xs="12" md="6">
        <MudCard>Content</MudCard>
    </MudItem>
</MudGrid>

<!-- After: Bootstrap -->
<div class="row">
    <div class="col-12 col-md-6">
        <div class="card">Content</div>
    </div>
    <div class="col-12 col-md-6">
        <div class="card">Content</div>
    </div>
</div>
```

### 3. Button Groups
```razor
<!-- Before: MudBlazor -->
<MudButtonGroup Color="Color.Primary" Variant="Variant.Outlined">
    <MudButton OnClick="@(() => _viewMode = "pipeline")">Pipeline</MudButton>
    <MudButton OnClick="@(() => _viewMode = "list")">List</MudButton>
</MudButtonGroup>

<!-- After: Bootstrap -->
<div class="btn-group" role="group">
    <button class="btn btn-outline-primary" @onclick="@(() => _viewMode = "pipeline")">Pipeline</button>
    <button class="btn btn-outline-primary" @onclick="@(() => _viewMode = "list")">List</button>
</div>
```

## Type Issues to Fix
1. **double to int conversions**: Add explicit casts `(int)Math.Round(value)`
2. **MudChip type inference**: Use `badge` or `span` with classes
3. **Lambda expression types**: Ensure proper return type annotations
4. **MouseEventArgs.StopPropagation**: Use `@onclick:stopPropagation` directive

## Testing Checklist
- [ ] All pages render without errors
- [ ] Navigation works correctly
- [ ] Responsive design functions
- [ ] All 65+ MudBlazor errors resolved
- [ ] Build completes successfully
- [ ] UI maintains similar visual appearance
- [ ] All interactions work (buttons, forms, etc.)

## Migration Priority
1. **Phase 1**: Dependencies and layout (MainLayout, App.razor)
2. **Phase 2**: Core pages (CustomerDashboard, CustomerProperties)
3. **Phase 3**: Remaining customer pages
4. **Phase 4**: Admin pages (Leads, Properties)
5. **Phase 5**: Testing and refinements
