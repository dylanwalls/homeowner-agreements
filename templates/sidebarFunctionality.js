// sidebarFunctionality.js
function initializeSidebar() {
    const toggleButton = document.querySelector('.toggle-button');
    const sidebar = document.querySelector('.sidebar');
  
    toggleButton.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  
    const menuButtons = document.querySelectorAll('.menu button');
    menuButtons.forEach(button => {
      button.addEventListener('click', () => {
        sidebar.classList.remove('open');
        // Handle section click logic here
      });
    });
  }
  
  export { initializeSidebar };
  