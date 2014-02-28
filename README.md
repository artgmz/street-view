# Street-View

## Description:
Creates a Google Maps Street View panorama object in a div of your choosing. Once initialized and visible, you will be able to move the panorama object to new GPS coordinates using either an external map or the controls within the panorama. Moving the panorama via its internal controls triggers an event that you can subscribe to in order to update the location indicator on your map via GPS coordinates.

You can also resize the panorama from half-screen to full-screen and vice-versa (just like in the newest version of Google Maps) by using the custom button in the upper-right corner.

## Dependencies:
* jQuery 2.0.3+
* Google Maps API v3
* TinyPubSub for jQuery 0.7.0
* Typicons v2

## Notes:
* You must initialize the module, which creates a panorama object, before working with it.
* You won't see anything in the panorama until you set its visibility to "true". This is to give you control over when to activate/deactivate street view.
* The "move(gps)" function causes an asynch call to Google, so it uses promises. Success moves the panorama and resolves the promise but doesn't return anything. Failure rejects the promise but returns nothing, so display an appropriate notification (usually happens when provided GPS coordinates don't have a corresponding image on Google servers).

## Sample Usage:
```
var sv = streetView("sampleDiv");

$.subscribe("new.streetView.location", function (evt, gps) {
    // Move location indicator on map.
});

sv.isVisible(true);

sv.move(gps).fail(function () {
    // Display failure to find panorama notification.
});
```