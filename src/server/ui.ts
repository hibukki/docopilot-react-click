const getUi = () => {
  return DocumentApp.getUi();
};

export const onOpen = () => {
  const menu = getUi()
    .createMenu('Docopilot')
    .addItem('Open Sidebar', 'openAboutSidebar');

  menu.addToUi();
};

export const openAboutSidebar = () => {
  const html = HtmlService.createHtmlOutputFromFile('sidebar-about-page');
  getUi().showSidebar(html);
};
