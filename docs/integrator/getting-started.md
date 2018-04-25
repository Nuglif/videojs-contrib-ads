# Getting Started

## Installation

### Install From NPM

```sh
npm install videojs-contrib-ads
```

### Using a module bundler

This is the recommended approach. If you are including `videojs-contrib-ads` using a module bundler such as [webpack](https://webpack.js.org/), this example is a useful starting point:

https://github.com/videojs/videojs-contrib-ads/blob/master/examples/module-import/entry.js

With this basic structure in place, you're ready to develop an ad plugin.

### Including the files in your HTML

This is not the recommended approach, but may be useful in some cases. In addition to the video.js library, you'll need two files from this project: `videojs.ads.js` and `videojs.ads.css`. After you build the project they are both in the `dist` directory.

Include the CSS in your HTML's `<head>` section with a `<link>` tag:

```html
<link rel="stylesheet" href="videojs.ads.css">
```

Then, include the JavaScript file after video.js, but before your ad plugin code:

```html
<video id="video" src="movie.mp4" controls></video>
<script src="video.js"></script>
<script src="videojs.ads.js"></script>
<script>
videojs('video', {}, function() {
  var player = this;
  player.ads(); // initialize the ad framework
  // your custom ad plugin code
});
</script>
```

### CDN Link

You may also use the Javascript and CSS links from the following to get started:
[https://cdnjs.com/libraries/videojs-contrib-ads](https://cdnjs.com/libraries/videojs-contrib-ads)

## Important Note About Initialization

In order to function correctly, videojs-contrib-ads must be initialized immediately after video.js (in the same [tick](http://blog.carbonfive.com/2013/10/27/the-javascript-event-loop-explained/)). This is for two reasons:

* This plugin relies on `loadstart` events, and initializing the plugin late means the plugin may miss an initial `loadstart`.
* For [Redispatch](#redispatch) to function it must be initialized before any other code that listens to media events.

The plugin will emit an error if it detects that it it missed a `loadstart` event. If this happens, it is likely that downstream failures will occur, so it's important to resolve this issue.

## Developing an Ad Plugin

First you call `player.ads()` to initialize the plugin. Afterwards, the flow of interaction between your ad plugin and contrib-ads might look like this:

* Player triggers `play` (EVENT) -- This media event is triggered when there is a request to play your player. videojs-contrib-ads responds by preventing content playback and showing a loading spinner.
* Ad Plugin triggers `adsready` (EVENT) -- Your ad plugin should trigger this event on the player to indicate that it is initialized. This can happen before or after the `play` event.
* Contrib Ads triggers `readyforpreroll` (EVENT) -- This event is fired after both `play` and `adsready` have ocurred. This signals that the ad plugin may begin an ad break by calling `startLinearAdMode`.
* Ad plugin calls `player.ads.startLinearAdMode()` (METHOD) -- This begins an ad break. During this time, your ad plugin plays ads. videojs-contrib-ads does not handle actual ad playback.
* Ad plugin triggers `ads-ad-started` (EVENT) - Trigger this when each individual ad begins with an event paramter `indexInBreak` that is the zero-based index of the individual ad out of the ads in the ad break. This removes the loading spinner, which otherwise stays up during the ad break. It's possible for an ad break to end without an ad starting, in which case the spinner stays up the whole time.
* Ad plugin calls `player.ads.endLinearAdMode()` (METHOD) -- This ends an ad break. As a result, content will play.
* Content plays.
* To play a Midroll ad, start and end an ad break with `player.ads.startLinearAdMode()` and `player.ads.endLinearAdMode()` at any time during content playback.
* Contrib Ads triggers `contentended` (EVENT) -- This event means that it's time to play a postroll ad.
* To play a Postroll ad, start and end an ad break with `player.ads.startLinearAdMode()` and `player.ads.endLinearAdMode()`.
* Contrib Ads triggers `ended` (EVENT) -- This standard media event happens when all ads and content have completed. After this, no additional ads are expected, even if the user seeks backwards.

This is the basic flow for a simple use case, but there are other things the ad plugin can do. Refer to the [API reference](api.md) for more information.

## Single Preroll Example

Here's an outline of what a basic ad plugin might look like.
It only plays a single preroll ad before each content video, but does demonstrate the interaction points offered by the ads plugin.

This is not actually a runnable example, as it needs more information as specified in the code comments.

```js
player.ads(); // initialize the ad framework

// request ads whenever there's new video content
player.on('contentchanged', function(){
  // fetch ad inventory asynchronously, then ...
  player.trigger('adsready');
});

player.on('readyforpreroll', function() {
  player.ads.startLinearAdMode();
  // play your linear ad content
  player.src('http://url/to/your/ad.content');

  // resume content when all your linear ads have finished
  player.one('adended', function() {
    player.ads.endLinearAdMode();
  });
});
```

Your actual ad plugin will be significantly more complex.
To implement midroll ads, you might listen to `timeupdate` events to monitor the progress of the content video's playback. To implement postroll ads, you'd listen to the `contentended` event.

For a more involved example that plays both prerolls and midrolls, see the [example directory](example) in this project. For more detailed information about what events and methods are available, see the [API reference](api.md).