export const Card = ({title, description, img}) => {    
  return (
    <div>
        <h2>{title}</h2>
        <p>{description}</p>
        <img src={img} alt="icon" />
    </div>
  )
}
