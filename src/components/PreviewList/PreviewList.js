import React from "react";
import { Link } from "react-router-dom";
import { Card, Image, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import ImagePreview from "../ImagePreview";
import "./style.scss";

class PreviewList extends React.PureComponent {
    renderImages() {
        const {
            items,
            direction,
            onClick,
            shouldRenderDescription,
            shouldRenderNameOnCard,
            shouldRenderNameBelowCard
        } = this.props;

        const xs = 12;
        const md = direction == "vertical" ? 12 : 6;
        const lg = direction == "vertical" ? 12 : 4;
        const padding = direction == "vertical" ? "p-0 pb-4" : "p-3";
        const placeholderName = "Lorem ipsum dolor sit amet";
        return items.map( ( item, index ) => {
            const { id, name, description, profileHash, cover_image_url, file } = item;
            const key = `${id}_${index}_${profileHash}`;

            return (
                <Col className={padding} id={id} xs={xs} md={md} lg={lg} key={key}>
                    <Link
                        className="router-link"
                        onClick={() => onClick( item )}
                        to={`/view/${profileHash}/${file}`}
                    >
                        <ImagePreview
                            id={id}
                            key={key}
                            name={name || placeholderName}
                            shouldRenderDescription={shouldRenderDescription}
                            shouldRenderNameOnCard={shouldRenderNameOnCard}
                            shouldRenderNameBelowCard={shouldRenderNameBelowCard}
                            description={description}
                            profileHash={profileHash}
                            cover_image_url={cover_image_url}
                            src={cover_image_url}
                            file={file}
                        />
                    </Link>
                </Col>
            );

            /*
        return (
            <Col className={padding} id={id} xs={xs} md={md} lg={lg} key={key}>
                <Link className="router-link" to={`/view/${profileHash}/${file}`}>
                    <span onClick={() => onClick( item )}>
                        <Card className="imageCard">
                            <Card.Header>{name || placeholderName}</Card.Header>
                            <Card.Img variant="top" src={cover_image_url} />
                            {shouldRenderDescription ? (
                                <Card.Body>
                                    <Card.Text>{description || placeholderDescription}</Card.Text>
                                </Card.Body>
                            ) : (
                                ""
                            )}
                        </Card>
                    </span>
                </Link>
            </Col>
        );
        */
        } );
    }

    render() {
        return <Row>{this.renderImages()}</Row>;
    }
}

PreviewList.propTypes = {
    items : PropTypes.array.isRequired,
    direction : PropTypes.string.isRequired,
    shouldRenderDescription : PropTypes.bool.isRequired,
    shouldRenderNameOnCard : PropTypes.bool.isRequired,
    shouldRenderNameBelowCard : PropTypes.bool.isRequired
};

export default PreviewList;
