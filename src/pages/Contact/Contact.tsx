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

      <div className="contact-form-container">
        <div className="form-box">
          <h2>Contact Us</h2>
          <p>
            Tell us what you need – our team is ready to support your logistics
            training journey!
          </p>

          <form>
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="text" placeholder="Organization" />
            <input type="text" placeholder="Phone Number" />
            <textarea placeholder="Messenger" rows={4} />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
