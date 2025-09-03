import "./contact.css";
import contact_1 from "../../assets/contact_1.png";
import contact_2 from "../../assets/contact_2.png";

const Contact = () => {
  return (
    <div className="contact-wrapper">
      <div className="contact-background">
        <img src={contact_1} alt="bg1" className="bg-image bg-left" />
        <img src={contact_2} alt="bg2" className="bg-image bg-right" />
      </div>
    </div>
  );
};

export default Contact;
