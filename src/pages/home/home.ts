import { Component } from '@angular/core';
import { NavController, Animation, Platform, Events, ToastController, FabContainer } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { MapType } from '@angular/compiler/src/output/output_ast';
import { Storage } from '@ionic/storage';
import { MarkerPoint } from '../../models/marker-point';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  map: GoogleMap;
  listMarkers: Array<MarkerPoint>;

  mapOptions: GoogleMapOptions = {
    camera: {
      target: {
        lat: 0,
        lng: 0
      },
      zoom: 18,
      tilt: 30,
    },
    mapType: 'MAP_TYPE_ROADMAP',
    controls: {
      compass: true,
      myLocationButton: true,
      indoorPicker: true,
      mapToolbar: true,
      zoom: false
    }
  }

  constructor(private platform: Platform,
    private geolocation: Geolocation,
    private googleMaps: GoogleMaps,
    public navCtrl: NavController,
    private diagnostic: Diagnostic,
    private androidPermissions: AndroidPermissions,
    private storage: Storage,
    private events: Events,
    private toastCtrl: ToastController) {
    platform.ready().then(async () => {
      try {
        let coarseLocationPermission = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
        let fineLocationPermission = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION);

        if (!coarseLocationPermission.hasPermission)
          coarseLocationPermission = await this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
        if (!fineLocationPermission.hasPermission)
          fineLocationPermission = await this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION);

        console.log('coarseLocationPermission: ' + JSON.stringify(coarseLocationPermission));
        console.log('fineLocationPermission: ' + JSON.stringify(fineLocationPermission));

        this.loadMap();
      } catch (error) {
        alert(JSON.stringify(error));
      }

      events.subscribe('updateMap', () => {
        this.updateMarkers();
      });
    });
  }

  updateMarkers() {
    this.map.clear().then(x => {
      this.storage.get('listMarkers').then(list => {
        this.listMarkers = list || [];
        this.listMarkers.forEach(markerPoint => {
          console.log('adding marker point: ' + markerPoint.title);
          this.addStorageMarker(markerPoint);
        });
      }).catch(error => alert(JSON.stringify(error)));
    }).catch(error => alert(error.message));
  }

  loadMap() {
    console.log('loadMap... start');
    this.checkLocation().then(check => {
      if (check) {
        console.log('checkLocation: OK!');
        this.geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }).then((position => {
          console.log('latitude: ' + position.coords.latitude);
          console.log('longitude: ' + position.coords.longitude);
          this.mapOptions.camera.target.lat = position.coords.latitude;
          this.mapOptions.camera.target.lng = position.coords.longitude;

          this.map = this.googleMaps.create('map', this.mapOptions);
          console.log('map: ' + JSON.stringify(this.map));

          this.map.one(GoogleMapsEvent.MAP_READY)
            .then(() => {
              this.updateMarkers();
            });

        })).catch((error) => alert(error.code + ' ' + error.message));
      } else
        alert('Error contacting GPS!');
    }).catch(error => alert(error.message));

    let watch = this.geolocation.watchPosition();
    watch.subscribe((geoposition) => {
      try {
        //this.showToast(`${geoposition.coords.latitude} x ${geoposition.coords.longitude}`);
        this.map.setCameraTarget({
          lat: geoposition.coords.latitude,
          lng: geoposition.coords.longitude
        });
      } catch (error) {
        alert(JSON.stringify(error));
      }
    });
  }

  addStorageMarker(markerPoint: MarkerPoint) {
    this.map.addMarker({
      animation: 'DROP',
      position: {
        lat: markerPoint.latitude,
        lng: markerPoint.longitude
      },
      icon: { url: 'assets/icons/' + markerPoint.icon || 'downloadicon.png' },
      title: markerPoint.title,
      snippet: markerPoint.description,
      draggable: true
    }).then((marker: Marker) => {
      marker.on(GoogleMapsEvent.MARKER_CLICK)
        .subscribe(() => {
          marker.showInfoWindow();
        });
      marker.on(GoogleMapsEvent.MARKER_DRAG_END)
        .subscribe(() => {
          markerPoint.latitude = marker.getPosition().lat;
          markerPoint.longitude = marker.getPosition().lng;
          this.storage.set('listMarkers', this.listMarkers)
            .catch((error) => console.error(error));
        });
    }).catch(error => alert(error.message));
  }

  addCurrentPositionMarker(fab: FabContainer) {
    fab.close();
    this.geolocation.getCurrentPosition().then(position => {

      let newMarkerPoint: MarkerPoint = {
        id: 0,
        title: 'New Marker (' + (this.listMarkers.length + 1) + ')',
        description: 'new point of interest!',
        icon: 'downloadicon.png',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      this.listMarkers.push(newMarkerPoint);

      this.storage.set('listMarkers', this.listMarkers).then(() => {
        this.map.addMarker({
          animation: 'DROP',
          position: {
            lat: newMarkerPoint.latitude,
            lng: newMarkerPoint.longitude
          },
          icon: { url: 'assets/icons/' + newMarkerPoint.icon },
          title: newMarkerPoint.title,
          snippet: newMarkerPoint.description
        }).then((marker: Marker) => {
          marker.showInfoWindow();
          marker.on(GoogleMapsEvent.MARKER_CLICK)
            .subscribe(() => {
              marker.showInfoWindow();
            });
          marker.on(GoogleMapsEvent.MARKER_DRAG_END)
            .subscribe(() => {
              newMarkerPoint.latitude = marker.getPosition().lat;
              newMarkerPoint.longitude = marker.getPosition().lng;
              this.storage.set('listMarkers', this.listMarkers)
                .catch((error) => console.error(error));
            });
        });
      }).catch((error) => console.error(error));
    }).catch((error) => console.error(error));
  }

  checkLocation(IfAlreadyOpenPunch: boolean = false) {
    return this.diagnostic.getLocationAuthorizationStatus().then(r => {
      let openPunchMsg = "";
      if (IfAlreadyOpenPunch) {
        openPunchMsg = " As you have already open punch.";
      }
      if (r == 'DENIED_ALWAYS' || r.toString().toLowerCase() == 'denied') {
        let message = "Please enable your app location.";
        alert(message + openPunchMsg);
        return false;
      }
      else {
        if (this.platform.is('android')) {
          return this.diagnostic.isGpsLocationAvailable().then(chk => {

            if (!(chk)) {
              let message = "Please set your location to High accuracy." + openPunchMsg;
              //  let message = "Please set your location Mode to Device Only. Location > Mode > Device Only"+IfAlreadyOpenPunch;
              alert(message);
              return false;
            }
            else {
              return true;
            }
          });

        }

      }
    }).catch(e => {
      return false;
    });
  }

  showToast(msg: string) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Toast: ' + msg);
    });

    toast.present();
  }

}
