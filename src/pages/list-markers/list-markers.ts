import { EditMarkerPage } from './../edit-marker/edit-marker';
import { MarkerPoint } from './../../models/marker-point';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController, Events } from 'ionic-angular';
import * as angular from "angular";

/**
 * Generated class for the ListMarkersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-list-markers',
  templateUrl: 'list-markers.html',
})
export class ListMarkersPage {

  listMarkers: Array<MarkerPoint> = [];

  constructor(platform: Platform, public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    private modalCtrl: ModalController,
    private events: Events) {

    platform.ready().then(() => {
      //this.updateListMakers();
      events.subscribe('updateListMakers', () => {
        this.updateListMakers();
      });      
    });
  }

  updateListMakers() {
    this.storage.get('listMarkers').then(list => {
      this.listMarkers = list;
    }).catch((error) => console.error(error));    
  }

  editMarkerPoint(markerPoint: MarkerPoint) {
    let _markerPoint = angular.copy(markerPoint);
    let modal = this.modalCtrl.create(EditMarkerPage, { markerPoint: _markerPoint });
    modal.onDidDismiss(data => {
      if (data) {
        angular.extend(markerPoint, data);
        console.log('saved: ' + JSON.stringify(markerPoint));
        this.storage.set('listMarkers', this.listMarkers)
          .catch((error) => alert(error.code + ' ' + error.message));
        console.log('listMarkers: ' + JSON.stringify(this.listMarkers));
      }
    });
    modal.present();
  }

  deleteMarkPoint(markerPoint: MarkerPoint) {
    let index = this.listMarkers.indexOf(markerPoint);
    this.listMarkers.splice(index, 1);
    this.storage.set('listMarkers', this.listMarkers)
      .catch((error) => alert(error.code + ' ' + error.message));
    console.log('listMarkers: ' + JSON.stringify(this.listMarkers));
  }

}
