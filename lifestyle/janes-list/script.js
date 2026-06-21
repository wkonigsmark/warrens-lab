// Jane's List - Restaurant ranking
// Basic framework for future enhancements

document.addEventListener('DOMContentLoaded', () => {
  const restaurantList = document.getElementById('restaurantList');

  // Add click handlers for future interactivity
  const items = restaurantList.querySelectorAll('.restaurant-item');
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      console.log(`Clicked: ${item.textContent}`);
    });
  });
});
