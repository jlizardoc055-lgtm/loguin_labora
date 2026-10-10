document.getElementById('form').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,msg=document.getElementById('mensaje');
 const data=Object.fromEntries(['nombre','correo','asunto','descripcion'].map(k=>[k,document.getElementById(k).value]));
 msg.textContent='Enviando...';
 try{const r=await fetch('/api/atencion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw Error(j.mensaje||'Error al registrar');msg.textContent=`Solicitud registrada. ID: ${j.id}. Código: ${j.codigo}. Guarda este código.`;form.reset()}catch(err){msg.textContent=err.message}
});
