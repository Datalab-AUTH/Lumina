import React from "react";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'


class CardNer extends React.Component {


    constructor(props) {
        super(props)

    }





    render() {

        let data = this.props.data;

        let card = null;

        // render a twitter card
        if (data !== null && data.entity_type === "twitter_handle") {
            card = (
                <div style={{ backgroundColor: "#afdcff" }} className="card m-2">
                    <div className="card-header">Twitter-handle</div>
                    <div className="card-body">
                        <img className="mx-auto" width="64" height="64" src={data.image}></img><br />
                        <strong>Name:</strong><span>{data.name}</span>
                        <hr />
                        <strong>Followers:</strong><span>{data.followers}</span><br />
                        <strong>Followees:</strong><span>{data.followees}</span><br />
                        <strong>Tweets:</strong><span>{data.tweets}</span><br />
                        <strong>Verified:</strong><span>True</span>
                    </div>
                </div>
            )
        } else if (data != null && data.entity_type === "geo") {
            card = (
                <div style={{ backgroundColor: "#22dcff" }} className="card m-2">
                    <div className="card-header">Geolocation</div>
                    <div className="card-body">
                        <strong>Name:</strong><span>{data.original_name}</span>
                        <hr />
                        <strong>Lon:</strong><span>{data.lon}</span><br />
                        <strong>Lat:</strong><span>{data.lat}</span><br />
                    </div>
                </div>


            );
        }
        else if (data != null && data.entity_type === "person") {
            card = (
                <div style={{ backgroundColor: "#afdcff" }} className="card m-2">
                <div className="card-header">Person</div>
                <div className="card-body">
                    <img className="mx-auto" width="180px"  src={data.image}></img><br />
                    <strong>Name:</strong><span>{data.name}</span>
                    <hr />
                    <strong>Surname:</strong><span>{data.surname}</span><br />
                    <strong>Gender:</strong><span>{data.gender}</span><br />
                    <strong>Birthdate:</strong><span>{data.birth_date}</span><br />
                    <strong>Description:</strong><span>{data.description}</span>
                </div>
            </div>


            );
        }
        else {
            card = (<code>{JSON.stringify(this.props.data)}</code>)
        }

        return (

            card
        )
    }

}

export default CardNer;