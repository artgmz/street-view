// Street View module.
// Wrapper to add events and extra UI. Also uses TinyPubSub for jQuery and Typicons.
var streetView = (function ($, gmaps) {
    "use strict";

    // Initialize Street View.
    // DIVID: Street View container's div id.
    function init(divId) {
        var options = { disableDoubleClickZoom: false, pov: { heading: 0, pitch: -5 },
                        visible: false, zoomControlOptions: { style: "SMALL" } },
            pano = new gmaps.StreetViewPanorama(document.getElementById(divId), options);

        // Add size toggle button to panorama.
        pano.controls[gmaps.ControlPosition.TOP_RIGHT].push(sizeToggleBtn());

        // Emit event when panorama changes to new position on map.
        gmaps.event.addDomListener(pano, "position_changed", function () {
            var pos = JSON.parse(JSON.stringify(pano.getPosition())),
                gps = $.map(pos, function(val, index) { return [val]; });
            $.publish("new.streetView.location", [{ lat: gps[0], lon: gps[1] }]);
        });

        // Helper to create and return size toggle button.
        function sizeToggleBtn() {
            var container = $("<div></div>"),
                userInterface = $("<div title=\"Maximize\"></div>"),
                content = $("<span class=\"typcn typcn-arrow-maximise\"></span>");

            container.css({ "padding": "5px" });
            userInterface.css({ "background-color": "#FFF", "border": "1px solid #CCC", "border-radius": "3px", "cursor": "pointer" });
            content.css({ "color": "#888", "font-size": "22px", "padding-right": "1px" });

            container.append(userInterface);
            userInterface.append(content);

            // Emit resize event on click.
            container.on("click", function () { resize(); });

            // Change button face on resize event.
            $.subscribe("resize.streetView", function () {
                if (content.hasClass("typcn-arrow-maximise")) {
                    content.removeClass("typcn-arrow-maximise");
                    content.addClass("typcn-arrow-minimise");
                    userInterface.attr("title", "Minimize");
                } else {
                    content.removeClass("typcn-arrow-minimise");
                    content.addClass("typcn-arrow-maximise");
                    userInterface.attr("title", "Maximize");
                }
            });

            return container.get(0);
        }

        // Async move and display panorama. Errors on location unavailable, succeeds otherwise.
        // GPS: { lat, lon } where...
            // LAT: Location's latitude.
            // LON: Location's longitude.
        function move(gps) {
            var sv = new gmaps.StreetViewService(),
                deferred = new $.Deferred();

            // Radius < 50 meters to get Street View nearest click action.
            sv.getPanoramaByLocation(new gmaps.LatLng(gps.lat, gps.lon), 25, function (data, status) {
                if (status === "OK") {
                    pano.setPano(data.location.pano);
                    isVisible(true);
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });

            return deferred.promise();
        }

        // Set panorama visibility.
        // BOOL: Boolean indicating if panorama should be visible.
        function isVisible(bool) { pano.setVisible(bool); }

        // Emit panorama resize events.
        function resize() {
            $.publish("resize.streetView");      // App event.
            gmaps.event.trigger(pano, "resize"); // Google Maps event.
        }

        // Instance methods.
        return {
            move: move,
            isVisible: isVisible,
            resize: resize
        };
    }

    // Module method.
    return { init: init };
})(jQuery, google.maps);