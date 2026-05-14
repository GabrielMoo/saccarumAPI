from google import genai

# Pon tu API Key aquí
client = genai.Client(api_key="AIzaSyAxjwIfi6QbbEF78royHWZgXuUQN9_NkK8")

print("Consultando a Google los modelos disponibles para tu cuenta...")
try:
    modelos = client.models.list()
    for m in modelos:
        print(f"- {m.name}")
except Exception as e:
    print("Error al consultar:", e)