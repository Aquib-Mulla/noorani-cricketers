document.addEventListener("DOMContentLoaded", function () {
    // ========== Sidebar Toggle ==========
    const manubaricon = document.getElementById("menubarmobile");
    if (manubaricon) {
      manubaricon.addEventListener("click", toggleSidebar);
    }

    function toggleSidebar() {
      const sidebar = document.getElementById("sidebar");
      sidebar.style.width = (sidebar.style.width === "250px") ? "0" : "250px";
    }

    // ========== Filter (Show more brands) ==========
  document.addEventListener("DOMContentLoaded", function () {
    const morebrandbutton = document.getElementById("morebrandbutton");
    const brandsname = document.querySelector(".more-brands");

    if (morebrandbutton && brandsname) {
      morebrandbutton.addEventListener("click", function () {
        console.log("clickeddd");
        const currentDisplay = window.getComputedStyle(brandsname).display;
        brandsname.style.display = (currentDisplay === "none") ? "block" : "none";
      });
    }
  });
});



// Select all "View Detail" buttons
const viewDetailButtons = document.querySelectorAll('.p-btn');

viewDetailButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Get the player's name from the card
    const playerName = button.closest('.p-card').querySelector('h2').textContent;

    // Encode the player name for URL
    const encodedName = encodeURIComponent(playerName);

    // Redirect to playerdetail.html with player name as query parameter
    window.location.href = `../../playerdetail.html`;
  });
});
