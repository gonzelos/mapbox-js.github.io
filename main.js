mapboxgl.accessToken = 'pk.eyJ1IjoiaHViZXJ0dXoiLCJhIjoiY2lqdGtrdWkwMDQ3enRha3MybG44Ym1vciJ9.7V6Q9IJm5P5NVsW5mVttFQ';

let savedData = localStorage.getItem("currentMapData");

let mapData =  savedData ? JSON.parse(savedData) : {
  width: 340,
  height: 440,
  lng: -122.44944,//21.06,
  lat: 37.76803,//52.23,
  style_id: "clecywkgm002801qro1y8p3eu",
  bearing: 0,
  zoom: 8.9,
  frTitPos: "center",
  frTitle: "Warsaw, Masovian Voivodeship, Poland",
  backTitle: "Stand by me forever",
};

function setMapData() {
  const str = `https://api.mapbox.com/styles/v1/hubertuz/${mapData.style_id}/static/${mapData.lng},${mapData.lat},${mapData.zoom}/${mapData.width}x${mapData.height}?access_token=${mapboxgl.accessToken}`;
  $("#downloadImage").attr('href', str);
  // $("#image").attr("src", str);
  $("#front-string").val(mapData.frTitle);
  $(".citymap-poster-name").text(mapData.frTitle);
  $("#back-string").val(mapData.backTitle);
  $(".back-title").text(mapData.backTitle);
  $(".citymap-poster-tagline").text(getDisplayLngLat());
  // $("#widthLabel").text(`Width: ${mapData.width}px`);
  // $("#heigtLabel").text(`Height: ${mapData.height}px`);
  
  localStorage.setItem("currentMapData", JSON.stringify(mapData));
}

const map = new mapboxgl.Map({
  container: 'map',
  style: "mapbox://styles/hubertuz/" + mapData.style_id,
  center: [mapData.lng, mapData.lat],
  zoom: mapData.zoom,
  scrollZoom: true
});

function getDisplayLngLat() {
  return `${Math.abs(mapData.lng).toFixed(2)}° N, ${Math.abs(mapData.lat).toFixed(2)}° E`;
}

function init() {
  setMapData()
  $("#map").css("width", mapData.width);
  $("#mapWidth").val(mapData.width);
  $("#heightLabel").text(`Height: ${mapData.height}px`);
  $("#map").css("height", mapData.height);
  $("#mapHeight").val(mapData.height);
  map.resize();
}

const geocoderSearch = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: 'Enter search e.g. Lincoln Park',
    mapboxgl: mapboxgl
});

map.on('load', () => {
  let serarchInput = geocoderSearch.onAdd(map);
  $("#geocoderSearchWrap").append(serarchInput);
  map.addControl(new mapboxgl.NavigationControl());
  $(".mapboxgl-ctrl-geocoder--input").on({
    change: function(e) {
      console.log(e.target.value,$(this).val());
      mapData.frTitle=$(this).val();
      // $("#front-string").val(e.target.value);
      // $(".citymap-poster-name").text(e.target.value);
    }
  });
  // $("#front-string").on({
  //   change: function(change) {
  //     $(".city-map-postername").val($(this).val());
  //   }
  // })
});

// map.on('click', (event) => {
// console.log(event);
// });

$(document).ready(function(){

  map.on('moveend',() => {
  
    mapData = {
      ...mapData,
      lng: map.getCenter().lng,
      lat: map.getCenter().lat,
      zoom: map.getZoom(),
      bearing:  map.getBearing(),
      width: $('#mapWidth').val(),
      height: $('#mapHeight').val(),
    }
  
    setMapData()
  })
  
  $("#mapWidth").on("input", function (e) {
    mapData.width = e.target.value;
    $("#widthLabel").text(`Width: ${mapData.width}px`);
    $("#map").css("width", mapData.width);
    setMapData()
    map.resize();
  })
  init();
  
  $("#mapHeight").on("input", function (e) {
    mapData.height = e.target.value;
    $("#heightLabel").text(`Height: ${mapData.height}px`);
    $("#map").css("height", mapData.height);
    setMapData()
    map.resize();
  })

  $(".frameOption").on({
    click: function(){
      $(".frameOption").removeClass('active');
      $(this).addClass('active');
      let bgUrl = $(this).data('bgurl');
        $(".map-poster").css("background-image", `url(${bgUrl})`);
    },  
  });

  $(".stylecircleoption").on({
    click: function(){
      $(".stylecircleoption").removeClass('active');
      $(this).addClass('active');
      mapData.style_id=$(this).data('style_id')
      map.setStyle("mapbox://styles/hubertuz/" + mapData.style_id);
      setMapData()
    },  
  });

  $("input[name=position-option]").on({
    change: function(e) {
      console.log(e.target.value, $(this).val())
      $(".citymap-poster-label").css("text-align",$(this).val());
      
    }
  });

  $("#front-string").on({
    keyup: function(e) {
      mapData.frTitle = $(this).val();
      setMapData();
    }
  });

  $("#back-string").on({
    keyup: function() {
      mapData.backTitle = $(this).val();
      setMapData();
    }
  });

  $("#color-picker").on('change', function(e) {
    $(".address-icon").css("color", $("#color-picker").val());
    console.log($("#color-picker").val());
  });

  $("#downloadImage").click((e) => {
    e.preventDefault();
    // Get a reference to the image element
    // var img = document.querySelectorAll("img")[9];
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = e.target.href;
    console.log(e.target.href);
    // Create a canvas element
img.onload = () => {
  var canvas = document.createElement('canvas');
    canvas.width = mapData.width;
    canvas.height = mapData.height;

    // Get the rendering context for the canvas
    var context = canvas.getContext('2d');

    // Draw the image onto the canvas
    context.drawImage(img, 0, 0);

    // Convert the canvas to an image file
    var dataURL = canvas.toDataURL('image/png');

    // Save the image file
    var link = document.createElement('a');
    link.download = 'image.png';
    link.href = dataURL;
    link.click();
}
  });
});
  
