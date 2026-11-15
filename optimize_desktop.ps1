# PowerShell script to apply desktop optimisation steps
# 1. Convert all JPEG/PNG images to WebP (quality 80)
# 2. Extract first 200 lines of the minified CSS as critical CSS
# 3. Inline critical CSS into each HTML page and adjust preload/link tags
# 4. Add font-display=swap to Google Fonts URL
# 5. Defer script.js loading
# 6. Remove stray '>>' symbols after tags

Set-Location "c:/kamal/tripura"

# ---- Step 1: Image conversion ----
Write-Host "Converting images to WebP..."
choco install webp -y > $null 2>&1
Get-ChildItem -Path "assets/images" -Include *.jpg, *.png -Recurse | ForEach-Object {
    $src = $_.FullName
    $dst = "$($src.Substring(0, $src.Length - $_.Extension.Length)).webp"
    if (-Not (Test-Path $dst)) {
        cwebp -q 80 $src -o $dst
    }
}

# ---- Step 2: Create critical CSS ----
Write-Host "Creating critical.css..."
Get-Content "style.min.css" -TotalCount 200 | Set-Content "critical.css"

# ---- Step 3: Update HTML files ----
$pages = @("index.html","chevella.html","moinabad.html","narsingi.html","gachibowli.html","kondapur.html")
foreach ($p in $pages) {
    if (Test-Path $p) {
        $html = Get-Content $p -Raw
        # Remove any existing <link rel="preload" ...> that points to style.css (old un‑minified file)
        $html = $html -replace '(?s)<link rel="preload"[^>]*?style\.css[^>]*?>', ''
        # Remove stray '>>' after tags (e.g., </link>>)
        $html = $html -replace '\>\>', '>'
        # Build critical CSS block
        $criticalBlock = "<style>`n$(Get-Content critical.css -Raw)`n</style>`n<link rel='preload' href='style.min.css' as='style' onload='this.rel=\'stylesheet\''>`n<link rel='stylesheet' href='style.min.css' media='print' onload='this.media=\'all\''>"
        # Insert after <head>
        $html = $html -replace '<head>', "<head>`n$criticalBlock"
        # Add font-display=swap to Google Fonts URL
        $html = $html -replace '(fonts.googleapis.com/css2[^"']*)', "${1}&display=swap"
        # Defer script.js if present
        $html = $html -replace '<script src="script.js">', '<script src="script.js" defer>'
        # Write back
        Set-Content $p $html
    }
}

Write-Host "Desktop optimisation completed."
