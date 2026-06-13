$files = Get-ChildItem -Path .\frontend\src\components\Admin\*.jsx, .\frontend\src\pages\Admin_dash.jsx

foreach ($f in $files) {
    (Get-Content $f.FullName) -replace 'sky-', 'indigo-' | Set-Content $f.FullName
}
