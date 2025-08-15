
// Mobile nav helper
function scrollRow(id, dir){
  const row = document.getElementById(id);
  if(!row) return;
  row.scrollBy({left: dir * 260, behavior: 'smooth'});
}
