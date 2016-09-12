# Dat Archiver

Server for archiving files via Dat. Upload files with [dat-push](https://github.com/joehand/dat-push). Runs a [peer network](https://github.com/mafintosh/peer-network) server.

## Installation

```
npm install -g dat-archiver
```

## Usage

On a server run:

```
dat-archiver my-backup-server --dir=archive_directory
```

Creates a dat-archiver server with name, with the server key `my-backup-server`. If key is not set, a 16 digit string will be generated. Dats files are saved to the current directory or `--dir` option.

On your local computer with Dat files:

```
dat-push my-backup-server --dir=directory_to_backup
```

This will push the files to your server over peer to peer networks.

## API

Dat archiver can run multiple archive servers to backup all archives to a single directory. See `cli.js` or [dat-publish](https://github.com/joehand/dat-publish) for an example.

### `var archiver = Archiver(opts)`

Create an archiver, options include:

```js
{
  dir: 'dats', // directory to store dat archives. Subdirectories are created using archive keys as the name
  getArchive: function (archiveKey, cb) {} // optional function to get archive on new dat-push connection. See example below.
}
```

#### getArchive function

The default getArchive function will create a new folder with the key name and prepare to download it with a `dat-push`.

The `getArchive` function can be useful in modules that manage their own archives. The default function will download the dat via [dat-js](https://github.com/joehand/dat-js). 

A custom `getArchive` function may look like this:

```js
function getArchive (datKey, cb) {
  if (err) throw err
  var dat = myDats[datKey]
  if (!dat) return cb() // no archive found, you could create it here
  dat.open(function () {
    cb(null, dat.archive)
  })
}
```

### archiver.join(serverKey)

Create and join a new peer-network server with name, `serverKey`. 

### Events

#### archiver.on('connection', serverKey)

New connection on `serverKey`

#### archiver.on('key-received', archiveKey)

Key received from `dat-push`. Emitted immediately before `getArchive(key)` is called.

#### archiver.on('archive-replicating', archiveKey)

Archive replication starting for `archiveKey`.

#### archiver.on('archive-finished', archiveKey)

Archive replication finished for `archiveKey`.

## License

ISC