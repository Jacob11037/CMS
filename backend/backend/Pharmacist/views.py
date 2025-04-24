from rest_framework.views import APIView
  from rest_framework.response import Response
  from rest_framework import status
  from django.contrib.auth import authenticate, login
  from .serializers import LoginSerializer

  class LoginView(APIView):
      def post(self, request):
          serializer = LoginSerializer(data=request.data)
          if serializer.is_valid():
              user = authenticate(
                  username=serializer.validated_data['username'],
                  password=serializer.validated_data['password']
              )
              if user is not None:
                  login(request, user)
                  return Response({'detail': 'Login successful'}, status=status.HTTP_200_OK)
              else:
                  return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
          return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)