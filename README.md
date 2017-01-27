soundload
=========

Usage
-----

This will download the SoundCloud track at the provided URL. You have to provide a valid API client ID.

The file will be named after the track and artist names and downloaded in the /download volume.


```
$ docker run --rm -v $(pwd):/download garphy/soundloader --client-id [client-id] [url]
```

Reference
---------
```
$ docker run --rm -v $(pwd):/download garphy/soundloader --help

  Usage: index [options] <trackUrl>

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -c, --client-id <clientId>  A Soundcloud API client ID
```
