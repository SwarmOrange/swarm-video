import React from "react";
import { Link } from "react-router-dom";
import { Card, Image, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import "./style.scss";

const ImagePreview = props => {
    const {
        id,
        name,
        description,
        profileHash,
        cover_image_url,
        file,
        src,
        shouldRenderDescription,
        shouldRenderNameOnCard,
        shouldRenderNameBelowCard
    } = props;
    const maxDescriptionLength = 122;
    const maxNameLength = 50;

    let cleanName = name ? name.slice( 0, maxNameLength ) : "";
    cleanName = cleanName.length == maxNameLength ? cleanName + "..." : cleanName;

    let cleanDescription = description ? description.slice( 0, maxDescriptionLength ) : "";
    cleanDescription =
        cleanDescription.length == maxDescriptionLength
            ? cleanDescription + "..."
            : cleanDescription;

    return (
        <div className="imagePreview__container imagePreview__imageCard text-center">
            <div className="imagePreview__content">
                <div className="imagePreview__content-overlay" />
                <img className="imagePreview__content-image" src={src} />
                <div className="imagePreview__content-details imagePreview__fadeIn-bottom">
                    {shouldRenderNameOnCard && (
                        <h3 className="imagePreview__content-title">{cleanName}</h3>
                    )}
                    {shouldRenderDescription && (
                        <p className="imagePreview__content-text">{cleanDescription}</p>
                    )}
                </div>
            </div>
            {shouldRenderNameBelowCard && (
                <h6 className="imagePreview__title mt-3 text-c">{name}</h6>
            )}
        </div>
    );
};

ImagePreview.propTypes = {
    id : PropTypes.number.isRequired,
    name : PropTypes.string.isRequired,
    description : PropTypes.string,
    profileHash : PropTypes.string.isRequired,
    cover_image_url : PropTypes.string.isRequired,
    //key : PropTypes.string.isRequired,
    src : PropTypes.string.isRequired,
    file : PropTypes.string.isRequired,
    shouldRenderDescription : PropTypes.bool.isRequired,
    shouldRenderNameOnCard : PropTypes.bool.isRequired,
    shouldRenderNameBelowCard : PropTypes.bool.isRequired
};

export default ImagePreview;
