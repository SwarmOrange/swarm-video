//import request from "request";

/*
const fileStructure = {
    beeFreeHost : "http://www.beefree.me/bzz:",
    profileLocation : "social/profile.json",
    allVideoAlbumsIndexLocation : "social/videoalbum/info.json",
    videoAlbumIndexLocation : "info.json"
};
*/
const SwarmApi = require( "../free-core/js/SwarmApi.js" );
const Blog = require( "../free-core/js/Blog.js" );

module.exports = class BeeFreeApi {
    constructor( beeFreeLocation ) {
        this.swarm = new SwarmApi( beeFreeLocation, null );
        this.blog = new Blog( this.swarm );
        this.beeFreeLocation = beeFreeLocation;
    }

    // Wrap the shared libaries around the given hash
    wrapHash( swarmHash ) {
        const swarm = new SwarmApi( this.beeFreeLocation, swarmHash );
        const blog = new Blog( swarm );

        return { swarm, blog };
    }

    getProfile() {
        this.blog
            .getProfile( "68fbd10c6538b21663a058e37876185d22e39af70b0ad0cde6eac62d7a24bbf7" )
            .then( result => console.log( result ) );
    }

    async getVideosFromAlbum( result ) {
        const { blog, album, swarmHash } = result;
        const { id } = album;

        return new Promise( ( resolve, reject ) => {
            blog
            .getVideoAlbumInfo( id )
            .then( result => resolve( result ) )
            .catch( err => reject( err ) )
        } );
    }

    dataURLtoBlob( dataurl ) {
        var arr = dataurl.split( "," ),
            mime = arr[0].match( /:(.*?);/ )[1],
            bstr = atob( arr[1] ),
            n = bstr.length,
            u8arr = new Uint8Array( n );

        while ( n-- ) {
            u8arr[n] = bstr.charCodeAt( n );
        }

        return new Blob( [ u8arr ], { type : mime } );
    }

    blobToFile( blob, fileName ) {
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        blob.lastModifiedDate = new Date();
        blob.name = fileName;

        return blob;
    }

    // @TODO: Perhaps later to free-core
    appendAlbum( hash, coverFile ) {
        return new Promise( ( resolve, reject ) => {
            const swarm = new SwarmApi( this.beeFreeLocation, hash );
            let targetBlog = new Blog( swarm );
            let newAlbumId;

            targetBlog
                .getLatestAlbumId()
                .then( response => {
                    if ( !response ) throw new Error( "No response" );

                    const latestAlbumId = response.albumId;
                    const id = latestAlbumId + 1;
                    const updatedHash = response.hash;
                    const albumName = `imported_album_${Date.now()}`;
                    const albumDescription = `Album was imported at ${new Date( Date.now() )}`;
                    console.log( `Creating new album with id ${id}` );
                    newAlbumId = id;

                    if ( updatedHash ) {
                        targetBlog = new Blog( new SwarmApi( this.beeFreeLocation, updatedHash ) );
                    }

                    return targetBlog.createVideoAlbum(
                        id,
                        albumName,
                        albumDescription,
                        null,
                        coverFile
                    );
                } )
                .then( response => {
                    const { hash } = response;

                    resolve( {
                        hash : hash,
                        albumId : newAlbumId
                    } );
                } )
                .catch( err => {
                    console.log( "Error during upload" );
                    console.log( err );

                    reject( err );
                } );
        } );
    }

    // @TODO: Perhaps later to free-core
    getAllVideosFromHash( hash ) {
        const wrapper = this.wrapHash( hash );
        const { blog } = wrapper;
        const beeFreeLocation = this.beeFreeLocation;

        return new Promise( ( resolve, reject ) => {
            blog.getVideoAlbumsInfo()
                .then( async result => {
                    const { data } = result;

                    const promises = data
                        .map( album => {
                            return { album, blog, swarmHash : hash };
                        } )
                        .map( this.getVideosFromAlbum );

                    await Promise.all( promises )
                        .then( results => {
                            resolve(
                                // Unpack response
                                results.reduce( ( total, result ) => {
                                    const album = result.data;
                                    const { id, videos } = album;

                                    total = total.concat(
                                        videos.map( ( item, index ) => {
                                            const { cover_file, file } = item;

                                            return {
                                                ...item,
                                                cover_image_url : `${beeFreeLocation}/bzz:/${hash}/${cover_file}`,
                                                file_url : `${beeFreeLocation}/bzz:/${hash}/${file}`,
                                                profileHash : hash
                                            };
                                        } )
                                    );

                                    return total;
                                }, [] )
                            );
                        } )
                        .catch( err => reject( err ) );

                    console.log( "Videos fetched" );
                } )
                .catch( err => reject( err ) );
        } );
    }
};
