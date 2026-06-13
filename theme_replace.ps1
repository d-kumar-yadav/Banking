$files = Get-ChildItem -Path .\frontend\src\components\Admin\*.jsx, .\frontend\src\pages\Admin_dash.jsx

foreach ($f in $files) {
    (Get-Content $f.FullName) -replace 'text-white', 'text-slate-800' `
    -replace 'text-\[\#f8fafc\]', 'text-slate-800' `
    -replace 'text-gray-200', 'text-slate-700' `
    -replace 'text-gray-300', 'text-slate-600' `
    -replace 'text-gray-400', 'text-slate-500' `
    -replace 'text-gray-500', 'text-slate-400' `
    -replace 'border-white/10', 'border-sky-200/50' `
    -replace 'bg-white/5', 'bg-white/60' `
    -replace 'bg-white/10', 'bg-white/80' `
    -replace 'hover:bg-white/5', 'hover:bg-sky-50' `
    -replace 'hover:bg-white/10', 'hover:bg-sky-100' `
    -replace 'hover:bg-white/20', 'hover:bg-sky-200' `
    -replace 'bg-\[\#0f172a\]', 'bg-sky-50' `
    -replace 'text-blue-400', 'text-sky-600' `
    -replace 'text-blue-300', 'text-sky-500' `
    -replace 'bg-blue-500/10', 'bg-sky-100' `
    -replace 'bg-blue-500/20', 'bg-sky-100' `
    -replace 'bg-purple-500/10', 'bg-indigo-100' `
    -replace 'text-purple-400', 'text-indigo-600' `
    -replace 'text-purple-300', 'text-indigo-500' `
    -replace 'bg-yellow-500/10', 'bg-amber-100' `
    -replace 'bg-yellow-500/20', 'bg-amber-100' `
    -replace 'text-yellow-400', 'text-amber-600' `
    -replace 'bg-green-500/10', 'bg-emerald-100' `
    -replace 'bg-green-500/20', 'bg-emerald-100' `
    -replace 'text-green-400', 'text-emerald-600' `
    -replace 'bg-red-500/10', 'bg-rose-100' `
    -replace 'bg-red-500/20', 'bg-rose-100' `
    -replace 'text-red-400', 'text-rose-600' | Set-Content $f.FullName
}
