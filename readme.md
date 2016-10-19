# Dat Archiver

Server for archiving files via Dat. Upload files with [dat-push](https://github.com/joehand/dat-push). 

Runs a [peer network](https://github.com/mafintosh/peer-network) server and archives files using [hypercore-archiver](https://github.com/mafintosh/hypercore-archiver).

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

### `var archiver = Archiver(opts)`

Create an archiver, options include:

```js
{
  dir: 'dats' // directory to store hypercore archives
}
```

### archiver.join(serverKey)

Create a new peer-network server with name, `serverKey`. `serverKey` can be any string. It will be used to tell where dat-push should connect to.

### Events

#### archiver.on('connection', serverKey)

New connection on `serverKey`

#### archiver.on('key received', archiveKey)

Key received from `dat-push`. Emitted immediately before `getArchive(key)` is called.

#### archiver.on('replication started', archiveKey)

Archive replication starting for `archiveKey`.

#### archiver.on('replication ended', archiveKey)

Archive replication ended for `archiveKey`. *Note: this could be a successful replication, or the client may have disconnected.*


## License

ISC
