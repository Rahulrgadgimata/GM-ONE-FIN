try:
    from app import app
    print('App imported successfully')
    if __name__ == '__main__':
        app.run(debug=True, host='0.0.0.0', port=5000)
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()