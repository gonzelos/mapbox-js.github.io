let config = {
  square: {
    viewSize: [400, 400],
    scaleValue: {
      cm: [
        [20, 20, 100],
        [30, 30, 200],
        [40, 40, 300],
        [50, 50, 400],
        [60, 60, 500],
        [70, 70, 600],
        [80, 80, 700],
        [90, 90, 800],
      ],
      inch: [
        [5, 5, 100],
        [10, 10, 200],
        [15, 15, 300],
        [20, 20, 400],
        [25, 25, 500],
        [30, 30, 600],
        [35, 35, 700],
        [40, 40, 800],
      ]
    },
  },
  portrait: {
    viewSize: [340, 440],
    scaleValue: {
      cm: [
        [10, 15, 110],
        [30, 30, 200],
        [40, 40, 300],
        [50, 50, 400],
        [60, 60, 500],
        [70, 70, 600],
        [80, 80, 700],
        [90, 90, 800],
      ],
      inch: [
        [5, 5, 100],
        [10, 10, 200],
        [15, 15, 300],
        [20, 20, 400],
        [25, 25, 500],
        [30, 30, 600],
        [35, 35, 700],
        [40, 40, 800],
      ]
    }
  },
  landscape: {
    viewSize: [440, 340],
    scaleValue: {
      cm: [
        [15, 10, 110],
        [30, 30, 200],
        [40, 40, 300],
        [50, 50, 400],
        [60, 60, 500],
        [70, 70, 600],
        [80, 80, 700],
        [90, 90, 800],
      ],
      inch: [
        [5, 5, 100],
        [10, 10, 200],
        [15, 15, 300],
        [20, 20, 400],
        [25, 25, 500],
        [30, 30, 600],
        [35, 35, 700],
        [40, 40, 800],
      ]
    }
  },
}
let selectedMarker;
mapboxgl.accessToken = 'pk.eyJ1IjoiaHViZXJ0dXoiLCJhIjoiY2lqdGtrdWkwMDQ3enRha3MybG44Ym1vciJ9.7V6Q9IJm5P5NVsW5mVttFQ';

let savedData = localStorage.getItem("currentMapData");

let mapData =  savedData ? JSON.parse(savedData) : {
  config: {
    viewType: "square",
    scale: 0,
    unit: "cm",
    downloadSize: 2000
  },
  lng: -122.44,//21.06,
  lat: 37.773,//52.23,
  style_id: "clecywkgm002801qro1y8p3eu",
  bearing: 0,
  zoom: 13,
  frTitPos: "center",
  frTitle: "San Francisco, California, United States",
  backTitle: "Stand by me forever",
  noteTitle: "This is the note.",
  frameOption: 'oak',
  markers: {},
};

function loading(status = true, title = 'loading...') {
  if(status) {
    $("body").css('overflow', 'hidden');
    $('.spinner-view').find('p').text(title);
    $('.spinner-view').show();
  } else {
    $("body").css('overflow', 'initial');
    $('.spinner-view').hide();
  }
}

loading();

function saveMapData() {
  localStorage.setItem("currentMapData", JSON.stringify(mapData));
}

function setMapView(w, h) {
  let vw = 1280;
  let vh = 1280;
  // if(mapData.config.viewType != "square") { 
    vw = (w - 12) / 0.334375;
    vh = (h - 12)  / 0.334375;
  // }
  $('.map').css('width', vw);
  $('.map').css('height', vh);
  $('.map-view').css('width', w);
  $('.map-view').css('height', h);
  $('.map').css('margin-top', -(vh - h + 12) / 2);
  $('.map').css('margin-left', -(vw - w + 12) / 2);
  $(".map-poster").css('width', w + 100);
  $(".map-poster").css('height', h + 120);
  map.resize();
}

function renderScaleButton() {
  let selectedScaleItems = config[mapData.config.viewType].scaleValue[mapData.config.unit];
  let $scaleBtn = $(".size-value > .size-type-wrapper").eq(0);
  $(".size-value").html("");
  selectedScaleItems.forEach((item, index) => {
    let [w, h, p] = item;
    $scaleBtn.find('.scale').text(`${w}x${h}`);
    $scaleBtn.find('.price').text(`${p}$`);
    if(index == mapData.config.scale) {
      $scaleBtn.addClass("active");
      let unit = mapData.config.unit == 'cm' ? "'" : '"';
      $('.scale-value').text(`${w + unit} x ${h + unit}`);
    } else {
      $scaleBtn.removeClass("active");
    }
    $scaleBtnClone = $scaleBtn.clone();
    $scaleBtnClone.data("value", index);
    $(".size-value").append($scaleBtnClone);
  });
}

function setMapData() {
  // $("#image").attr("src", str);
  $("#front-string").val(mapData.frTitle);
  $(".citymap-poster-name").text(mapData.frTitle);
  $("#back-string").val(mapData.backTitle);
  $(".back-title").text(mapData.backTitle);
  $("#note-input").val(mapData.noteTitle);
  $(".note-title").text(mapData.noteTitle);
  $(".citymap-poster-tagline").text(getDisplayLngLat());
  $(`.size-type-div > .size-unit-wrapper > .size-unit[data-value=${mapData.config.unit}]`).addClass("active");
  $(`.px-scale-wrapper[data-value=${mapData.config.downloadSize}]`).addClass("active");
  $(`.size-type-div > .size-type-wrapper[data-value=${mapData.config.viewType}]`).trigger("click");
  $(`.frameOption[data-value='${mapData.frameOption}']`).trigger("click");
  $(`.form-check-input[name=position-option][value='${mapData.frTitPos}']`).trigger("click");
  $('.map-poster').css("opacity", 1);
  $("#zoomval").text(getDisplayZoom());
}

function getImgLink(style_id, vw, vh) {
  return `https://api.mapbox.com/styles/v1/hubertuz/${style_id}/static/${mapData.lng},${mapData.lat},${mapData.zoom}/${vw}x${vh}?access_token=${mapboxgl.accessToken}`;
}

function download(file_name, style_id) {
  loading(true, 'Map generating...');
  let vw = Number($('#download-image-size').val());
  let mvw = Number($('.map').css('width').replace('px', ''));
  let mvh = Number($('.map').css('height').replace('px', ''));
  let vh = vw * mvh / mvw;
  // document.querySelector('.mapboxgl-canvas').toBlob(function (blob) {
    // saveAs(getImgLink(style_id, vw, vh), file_name + '.png');
    // console.log(getImgLink(style_id, vw, vh));
  // });

  let copyMap  = $('<div>', {
    id: 'copy-map',
  }).css({
    width: vw,
    height: vh,
  });

  $('body').append(copyMap);

  const map_download = new mapboxgl.Map({
    container: 'copy-map',
    style: "mapbox://styles/hubertuz/" + style_id,
    center: [mapData.lng, mapData.lat],
    zoom: mapData.zoom + Math.log(vw / mvw) / Math.log(2)
  });

  map_download.on('load', function () {
    map_download.getCanvas().toBlob(function (blob) {
      saveAs(blob, file_name);
      copyMap.remove();
      loading(false);
    })
  })
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

function getDisplayZoom() {
  return Math.abs(mapData.zoom).toFixed(1);
}

function init() {
  $(".mapboxgl-ctrl-logo").remove();
  $(".mapboxgl-ctrl-bottom-right").remove();
  renderScaleButton();
  setMapData()
}

const geocoderSearch = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: 'Enter search e.g. Lincoln Park',
    mapboxgl: mapboxgl
});
map.on('load', () => {  
  $('.spinner-view').hide();
  let serarchInput = geocoderSearch.onAdd(map);
  $("#geocoderSearchWrap").append(serarchInput);
  map.addControl(new mapboxgl.NavigationControl());
  $(".mapboxgl-ctrl-geocoder--input").on({
    change: function(e) {
      mapData.frTitle=$(this).val();
      // $("#front-string").val(e.target.value);
      // $(".citymap-poster-name").text(e.target.value);
    }
  });
  for (const key in mapData.markers) {
    if (Object.hasOwnProperty.call(mapData.markers, key)) {
      const markerLoc = mapData.markers[key];
      let markerElement = document.createElement('div');
      let [name, markerId] = key.split('_');
      markerElement.appendChild(document.querySelector(`.address-icon[name=${name}]`).cloneNode());
      const marker = new mapboxgl.Marker({
        draggable: true,
        element:markerElement
      })
      .setLngLat(markerLoc)
      .addTo(map);
      marker.markerId = key;
      markerElement.addEventListener('click', function (e) {
        // console.log(e);
        if(selectedMarker) {
          selectedMarker.find('.address-icon').removeClass('active');
        }
        $(this).find('.address-icon').addClass('active');
        selectedMarker = $(this);
      });
      function onDragEnd() {
        const lngLat = marker.getLngLat();
        // markerpos.style.display = 'block';
        $("#markerpos").text(`Longitude: ${lngLat.lng} Latitude: ${lngLat.lat}`);
        mapData.markers[marker.markerId] = [lngLat.lng, lngLat.lat];
        saveMapData();
      }
      marker.on('dragend', onDragEnd);
    }
  }
  loading(false);
});

$(".btn-download").click(function(e) {
  e.preventDefault();
  const style_id = $(this).data('style_id');
  const fileName = $(this).data('file_name');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milli = now.getMilliseconds();
  const fullDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}_${milli}_`;
  // map.setStyle("mapbox://styles/hubertuz/" + style_id);
  download(fullDate + fileName, style_id);
});

$(document).ready(function(){

  map.on('moveend',() => {
  
    mapData = {
      ...mapData,
      lng: map.getCenter().lng,
      lat: map.getCenter().lat,
      zoom: map.getZoom(),
      bearing:  map.getBearing(),
    }
  
    setMapData()
    saveMapData();
  })

  $(".frameOption").on({
    click: function(){
      $(".frameOption").removeClass('active');
      $(this).addClass('active');
      let bgUrl = $(this).data('bgurl');
      $(".map-poster").css("background-image", `url(${bgUrl})`);
        if(mapData.frameOption == $(this).data('value')) {
          return;
        }
        mapData.frameOption = $(this).data('value');
        setMapData();
        saveMapData();
    }, 
  });

  $(".stylecircleoption").on({
    click: function(){
      $(".stylecircleoption").removeClass('active');
      $(this).addClass('active');
      mapData.style_id=$(this).data('style_id')
      map.setStyle("mapbox://styles/hubertuz/" + mapData.style_id);
      setMapData();
      saveMapData();
    },  
  });

  // $(".frameType").on({
  //   click: function(){
  //     $(".frameType").removeClass('active');
  //     $(this).addClass('active');
      
  //   },  
  // });

  $(".px-scale-wrapper").on({
    click: function() {
      $(".px-scale-wrapper").removeClass('active');
      $(this).addClass('active');
      mapData.config.downloadSize = $(this).data('value');
    },
  });

  $("input[name=position-option]").on({
    change: function(e) {
      $(".citymap-poster-label").css("text-align",$(this).val());
      mapData.frTitPos = $(this).val();
      saveMapData();
    }
  });

  $("#front-string").on({
    keyup: function(e) {
      mapData.frTitle = $(this).val();
      setMapData();
      saveMapData();
    }
  });

  $("#back-string").on({
    keyup: function() {
      mapData.backTitle = $(this).val();
      setMapData();
      saveMapData();
    }
  });

  $("#note-input").on({
    keyup: function() {
      mapData.noteTitle = $(this).val();
      setMapData();
      saveMapData();
    }
  });

  $("#color-picker").on('change', function(e) {
    $(".address-icon").css("color", $("#color-picker").val());
  });

  $(".size-type-div > .size-type-wrapper").click(function (e) {
    $('.size-type-div > .size-type-wrapper').removeClass('active');
    $(this).addClass('active');
    let viewType = $(this).data('value');
    mapData.config.viewType = viewType;
    mapData.config.scale = 0;
    renderScaleButton();
    setMapView(...config[viewType].viewSize);
  });
  
  $(".size-type-div > .size-unit-wrapper > .size-unit").click(function (e) {
    $('.size-type-div > .size-unit-wrapper > .size-unit').removeClass('active');
    $(this).addClass('active');
    let unit = $(this).data('value');
    mapData.config.unit = unit;
    mapData.config.scale = 0;
    renderScaleButton();
  });

  $(document).on("click", ".size-value > .size-type-wrapper", function (e) {
    $('.size-value > .size-type-wrapper').removeClass('active');
    $(this).addClass('active');
    let scale = $(this).data('value');
    mapData.config.scale = scale;
    renderScaleButton()
  });

  $('#accordion .collapse').on('shown.bs.collapse', function () {
    // Get the top position of the open accordion
    var offset = $(this).offset().top;
  
    // Smoothly scroll the page to the top of the open accordion
    $('.sidebar').animate({
      scrollTop: offset
    }, 500);
  });

  $(".address-icon").on({
    click: function(e) {
      let markerId = Date.now();
      var markerElement = document.createElement('div');
      markerElement.appendChild(e.target.cloneNode());
      markerElement.setAttribute('data-key', markerId);
      let key = $(this).attr("name") + "_" + markerId;
      mapData.markers[key] = [mapData.lng, mapData.lat];
      const marker = new mapboxgl.Marker({
        draggable: true,
        element:markerElement
      })
      .setLngLat([mapData.lng, mapData.lat])
      .addTo(map);
      marker.markerId = key;
      // selectedMarker = marker;
      // markers.push(marker);
      markerElement.addEventListener('click', function (e) {
        // console.log(e);
        if(selectedMarker) {
          selectedMarker.find('.address-icon').removeClass('active');
        }
        $(this).find('.address-icon').addClass('active');
        selectedMarker = $(this);
      });
      function onDragEnd(e) {
        const lngLat = marker.getLngLat();
        // markerpos.style.display = 'block';
        $("#markerpos").text(`Longitude: ${lngLat.lng} Latitude: ${lngLat.lat}`);
        // console.log($(this)._element, e.target)
          mapData.markers[marker.markerId] = [lngLat.lng, lngLat.lat];
          saveMapData();
          // console.log(mapData.markers);
      }
      marker.on('dragend', onDragEnd);
      console.log(mapData.markers);
      saveMapData();
    }
  })

  $(".remove-icon").on({
    click: function () {
      if(selectedMarker) {
        selectedMarker.remove();
        delete mapData.markers[selectedMarker.markerId];
        selectedMarker = undefined;
        saveMapData();
      } else {
        alert("Please select icon!");
      }
    }
  })
  
  init();

  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });
 
})