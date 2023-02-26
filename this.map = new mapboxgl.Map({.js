this.map = new mapboxgl.Map({
  container: "map",
  style: "<style_url>",
});
this.marker = new mapboxgl.Marker();
this.map.on('click', this.add_marker.bind(this));

add_marker: function (event) {
  var coordinates = event.lngLat;
  console.log('Lng:', coordinates.lng, 'Lat:', coordinates.lat);
  this.marker.setLngLat(coordinates).addTo(this.map);
}

https://docs.mapbox.com/mapbox-gl-js/example/drag-a-marker/


mapboxgl.accessToken = 'pk.eyJ1IjoiaHViZXJ0dXoiLCJhIjoiY2lqdGtrdWkwMDQ3enRha3MybG44Ym1vciJ9.7V6Q9IJm5P5NVsW5mVttFQ';
const coordinates = document.getElementById('coordinates');
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [0, 0],
    zoom: 2
});

const marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat([0, 0])
    .addTo(map);

function onDragEnd() {
    const lngLat = marker.getLngLat();
    coordinates.style.display = 'block';
    coordinates.innerHTML = `Longitude: ${lngLat.lng}<br />Latitude: ${lngLat.lat}`;
}

marker.on('dragend', onDragEnd);
