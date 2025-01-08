import bcrypt from 'bcryptjs';

class NdEncriptacion {

   
    encriptar(texto: string): string {
    
        let _textoEncriptado: string = bcrypt.hashSync(texto, 10)
    
        return _textoEncriptado;
      }
    
      comparar(textoSinEncriptar :string, textoEncriptado: string): boolean{
        return bcrypt.compareSync(textoSinEncriptar, textoEncriptado)
      }    


}

export default NdEncriptacion;