export default function ApplicationLogo(props) {
    return (
        <img
            src="/images/bolo_logo.png"
            alt="Bolo Academy"
            {...props}
            style={{ objectFit: 'contain', ...props.style }}
        />
    );
}
