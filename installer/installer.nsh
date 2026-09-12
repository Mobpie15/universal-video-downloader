!define MUI_LICENSEPAGE_RADIOBUTTONS

!macro customInstall
  DetailPrint "Creating Desktop and Start Menu shortcuts..."
  CreateShortCut "$DESKTOP\Pie Video Downloader.lnk" "$INSTDIR\Pie Video Downloader.exe" "" "$INSTDIR\Pie Video Downloader.exe" 0
  CreateDirectory "$SMPROGRAMS\Pie Video Downloader"
  CreateShortCut "$SMPROGRAMS\Pie Video Downloader\Pie Video Downloader.lnk" "$INSTDIR\Pie Video Downloader.exe" "" "$INSTDIR\Pie Video Downloader.exe" 0
  CreateShortCut "$SMPROGRAMS\Pie Video Downloader.lnk" "$INSTDIR\Pie Video Downloader.exe" "" "$INSTDIR\Pie Video Downloader.exe" 0
!macroend

!macro customUnInstall
  Delete "$DESKTOP\Pie Video Downloader.lnk"
  Delete "$SMPROGRAMS\Pie Video Downloader.lnk"
  Delete "$SMPROGRAMS\Pie Video Downloader\Pie Video Downloader.lnk"
  RMDir "$SMPROGRAMS\Pie Video Downloader"
!macroend
