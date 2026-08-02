export function ProjectOverview() {
  return (
    <section
      aria-labelledby="sobre-gente-daqui"
      className="rounded-2xl border border-[#d9d6f4] bg-[#f7f6ff] p-5 text-[#1b1830]"
    >
      <h2 id="sobre-gente-daqui" className="text-base font-extrabold">
        Sobre o Gente Daqui
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#4b4768]">
        O Gente Daqui é uma proposta para aproximar jovens do bairro de
        oportunidades reais de trabalho e renda. A ideia é:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-5 text-[#4b4768] marker:text-[#4338ca]">
        <li>Mostrar caminhos e áreas profissionais que podem fazer sentido para você.</li>
        <li>Conectar você a mentores do próprio bairro que já passaram por experiências parecidas.</li>
        <li>Promover orientação entre pares: conversas práticas para tirar dúvidas e entender os próximos passos.</li>
        <li>Indicar cursos, vagas, seleções e outras oportunidades gratuitas ou acessíveis.</li>
        <li>Oferecer acompanhamento no seu ritmo, pelo celular ou presencialmente, para que você não precise fazer esse caminho sozinho.</li>
      </ul>
    </section>
  );
}
