/* HOUSE — ÚNICO lugar para atualizar o endereço do delivery. */
const DELIVERY_URL = 'https://www.ifood.com.br/delivery/porto-velho-ro/house-hamburgueria-sao-joao-bosco/9ae89fa3-a57f-4e6f-bf1e-2b7df31a2452';

/*
 * DADOS A VALIDAR ANTES DA PUBLICAÇÃO:
 * - whatsappNumber: mantido do HTML original. CONFIRMAR, pois aparenta faltar um dígito.
 * - hours: informar dias e horas oficiais; nunca preencher por estimativa.
 * - mapEmbed: colocar link oficial do Google Maps > Compartilhar > Incorporar um mapa.
 * - product/hero/gallery/about photos: usar SOMENTE conteúdo autorizado da própria House.
 * - O endereço abaixo é mantido exatamente como informado no site original.
 * - As regras e categorias do Clube House foram preservadas do HTML original.
 */
const HOUSE_CONFIG = {
  delivery: DELIVERY_URL,
  whatsappNumber: '556993320235', // PENDENTE: confirmar antes de publicar
  whatsappMessage: 'Olá! Vim pelo site da House Hamburgueria e gostaria de mais informações.',
  instagram: 'https://www.instagram.com/housepvh/',
  maps: 'https://www.google.com/maps/place/House+Hamburgueria+-+R.+Abun%C3%A3,+2433+-+S%C3%A3o+Jo%C3%A3o+Bosco,+Porto+Velho+-+RO,+76803-762/@-8.7513364,-63.8933493,15z/data=!4m6!3m5!1s0x92325ccbf4910e0f:0x16a285ecde4fd06b!8m2!3d-8.7513364!4d-63.8933493!16s%2Fg%2F11g8481115',
  club: 'https://www.v2.donuz.co/househamburgueria/cadastro',
  mapEmbed: '', // Ex.: URL HTTPS genuína de /maps/embed?pb=... (somente ao confirmar).
  hours: [
    // { day: 'Dias de atendimento confirmados', time: 'Horário oficial' }
  ],
  heroPhotos: [
    { src:'referencias/hero-referencia-01.webp', alt:'Imagem de referência do projeto original; produto não identificado oficialmente', caption:'IMAGEM DE REFERÊNCIA · AGUARDANDO FOTO OFICIAL' },
    { src:'referencias/hero-referencia-02.webp', alt:'Segunda imagem de referência do projeto original; produto não identificado oficialmente', caption:'IMAGEM DE REFERÊNCIA · AGUARDANDO FOTO OFICIAL' },
    { src:'referencias/hero-referencia-03.webp', alt:'Terceira imagem de referência do projeto original; produto não identificado oficialmente', caption:'IMAGEM DE REFERÊNCIA · AGUARDANDO FOTO OFICIAL' },
    // { src:'assets/images/foto-house-01.webp', alt:'Descrição verdadeira da foto', caption:'Nome oficial do produto (opcional)' }
  ],
  aboutPhoto: '', // Ex.: 'assets/images/ambiente-house.webp' — apenas foto oficial autorizada.
  aboutPhotoAlt: '',
  products: [
    // { name:'Nome oficial', description:'Descrição oficial resumida', price:'R$ ...', image:'assets/images/produto.webp', alt:'Descrição da fotografia' }
    // Só cadastre quando nome/descrição/preço estiverem comprovados; price pode ficar vazio.
  ],
  galleryPhotos: [
    { src:'referencias/galeria-referencia-01.webp', alt:'Imagem ilustrativa do arquivo original, não identificada como produto oficial' },
    { src:'referencias/galeria-referencia-02.webp', alt:'Detalhe ilustrativo do arquivo original, não identificado como produto oficial' },
    { src:'referencias/galeria-referencia-03.webp', alt:'Outra imagem ilustrativa do arquivo original, não identificada como produto oficial' },
    // { src:'assets/images/foto-house.webp', alt:'Descrição verdadeira da foto', caption:'Legenda opcional' }
  ]
};
